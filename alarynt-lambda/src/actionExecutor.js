/**
 * Action Executor for Alarynt Lambda
 * 
 * This module handles execution of different types of actions
 * including email, SMS, webhooks, database operations, and notifications.
 */

const AWS = require('aws-sdk');
const axios = require('axios');
const nodemailer = require('nodemailer');
const DatabaseManager = require('./database');

class ActionExecutor {
  constructor(options = {}) {
    this.logger = options.logger;
    this.executionId = options.executionId;
    
    // Initialize AWS services
    this.ses = new AWS.SES({ region: process.env.AWS_REGION || 'us-east-1' });
    this.sns = new AWS.SNS({ region: process.env.AWS_REGION || 'us-east-1' });
    
    // Initialize email transporter (fallback to SMTP if SES not available)
    this.emailTransporter = this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter
   * @returns {object} - Nodemailer transporter
   */
  initializeEmailTransporter() {
    if (process.env.EMAIL_PROVIDER === 'ses') {
      return nodemailer.createTransporter({
        SES: this.ses
      });
    } else if (process.env.SMTP_HOST) {
      return nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
    } else {
      // Default to console logging for development
      return nodemailer.createTransporter({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }

  /**
   * Execute an action based on its type
   * @param {object} actionConfig - Action configuration
   * @param {object} context - Execution context
   * @returns {Promise<object>} - Execution result
   */
  async executeAction(actionConfig, context = {}) {
    const startTime = Date.now();
    const actionId = actionConfig.id || `action_${Date.now()}`;

    this.logger?.info('Executing action', {
      actionId,
      actionType: actionConfig.type,
      executionId: this.executionId
    });

    try {
      let result;

      switch (actionConfig.type) {
        case 'email':
          result = await this.executeEmailAction(actionConfig, context);
          break;
        case 'sms':
          result = await this.executeSMSAction(actionConfig, context);
          break;
        case 'webhook':
          result = await this.executeWebhookAction(actionConfig, context);
          break;
        case 'database':
          result = await this.executeDatabaseAction(actionConfig, context);
          break;
        case 'notification':
          result = await this.executeNotificationAction(actionConfig, context);
          break;
        default:
          throw new Error(`Unsupported action type: ${actionConfig.type}`);
      }

      const executionTime = Date.now() - startTime;

      // Update action performance metrics if it's a stored action
      if (actionConfig.actionId) {
        await DatabaseManager.queryHelpers.updateActionPerformance(
          actionConfig.actionId,
          executionTime,
          result.success
        );
      }

      this.logger?.logActionExecution(
        actionId,
        actionConfig.type,
        { success: true, data: result.data },
        executionTime
      );

      return {
        actionId,
        actionType: actionConfig.type,
        success: true,
        executionTime,
        ...result
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      this.logger?.logActionExecution(
        actionId,
        actionConfig.type,
        { success: false, error: error.message },
        executionTime
      );

      return {
        actionId,
        actionType: actionConfig.type,
        success: false,
        error: error.message,
        executionTime
      };
    }
  }

  /**
   * Execute email action
   * @param {object} actionConfig - Email action configuration
   * @param {object} context - Execution context
   * @returns {Promise<object>} - Execution result
   */
  async executeEmailAction(actionConfig, context) {
    const { to, cc, bcc, subject, body, html, template } = actionConfig.config;

    let emailBody = body || '';
    let emailHtml = html || '';

    // If template is specified, use it
    if (template) {
      const templateData = await this.getEmailTemplate(template);
      if (templateData) {
        emailBody = this.interpolateTemplate(templateData.text || emailBody, context);
        emailHtml = this.interpolateTemplate(templateData.html || emailHtml, context);
      }
    }

    // Interpolate variables in subject and body
    const interpolatedSubject = this.interpolateTemplate(subject, context);
    const interpolatedBody = this.interpolateTemplate(emailBody, context);
    const interpolatedHtml = this.interpolateTemplate(emailHtml, context);

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@alarynt.com',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: interpolatedSubject,
      text: interpolatedBody
    };

    if (cc) {
      mailOptions.cc = Array.isArray(cc) ? cc.join(', ') : cc;
    }

    if (bcc) {
      mailOptions.bcc = Array.isArray(bcc) ? bcc.join(', ') : bcc;
    }

    if (interpolatedHtml) {
      mailOptions.html = interpolatedHtml;
    }

    const result = await this.emailTransporter.sendMail(mailOptions);

    return {
      data: {
        messageId: result.messageId,
        to: mailOptions.to,
        subject: mailOptions.subject,
        sent: true
      }
    };
  }

  /**
   * Execute SMS action
   * @param {object} actionConfig - SMS action configuration
   * @param {object} context - Execution context
   * @returns {Promise<object>} - Execution result
   */
  async executeSMSAction(actionConfig, context) {
    const { to, message } = actionConfig.config;

    const interpolatedMessage = this.interpolateTemplate(message, context);

    const params = {
      Message: interpolatedMessage,
      PhoneNumber: to,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        }
      }
    };

    const result = await this.sns.publish(params).promise();

    return {
      data: {
        messageId: result.MessageId,
        to,
        message: interpolatedMessage,
        sent: true
      }
    };
  }

  /**
   * Execute webhook action
   * @param {object} actionConfig - Webhook action configuration
   * @param {object} context - Execution context
   * @returns {Promise<object>} - Execution result
   */
  async executeWebhookAction(actionConfig, context) {
    const { url, method = 'POST', headers = {}, body, timeout = 30000 } = actionConfig.config;

    const interpolatedUrl = this.interpolateTemplate(url, context);
    let requestBody = body;

    if (typeof body === 'string') {
      requestBody = this.interpolateTemplate(body, context);
      try {
        requestBody = JSON.parse(requestBody);
      } catch (error) {
        // Keep as string if not valid JSON
      }
    } else if (body) {
      requestBody = this.interpolateObjectTemplate(body, context);
    }

    const config = {
      method: method.toLowerCase(),
      url: interpolatedUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Alarynt-Lambda/1.0.0',
        ...headers
      },
      timeout,
      data: requestBody
    };

    const response = await axios(config);

    return {
      data: {
        url: interpolatedUrl,
        method,
        statusCode: response.status,
        responseData: response.data,
        responseHeaders: response.headers,
        requestSent: true
      }
    };
  }

  /**
   * Execute database action
   * @param {object} actionConfig - Database action configuration
   * @param {object} context - Execution context
   * @returns {Promise<object>} - Execution result
   */
  async executeDatabaseAction(actionConfig, context) {
    const { operation, collection, filter, update, data } = actionConfig.config;

    const schemas = DatabaseManager.schemas;
    let result;

    switch (operation) {
      case 'create':
      case 'insert':
        const Model = schemas[collection];
        if (!Model) {
          throw new Error(`Unknown collection: ${collection}`);
        }
        const interpolatedData = this.interpolateObjectTemplate(data, context);
        const document = new Model(interpolatedData);
        result = await document.save();
        break;

      case 'update':
        const UpdateModel = schemas[collection];
        if (!UpdateModel) {
          throw new Error(`Unknown collection: ${collection}`);
        }
        const interpolatedFilter = this.interpolateObjectTemplate(filter, context);
        const interpolatedUpdate = this.interpolateObjectTemplate(update, context);
        result = await UpdateModel.findOneAndUpdate(interpolatedFilter, interpolatedUpdate, { new: true });
        break;

      case 'delete':
        const DeleteModel = schemas[collection];
        if (!DeleteModel) {
          throw new Error(`Unknown collection: ${collection}`);
        }
        const interpolatedDeleteFilter = this.interpolateObjectTemplate(filter, context);
        result = await DeleteModel.findOneAndDelete(interpolatedDeleteFilter);
        break;

      case 'find':
      case 'query':
        const QueryModel = schemas[collection];
        if (!QueryModel) {
          throw new Error(`Unknown collection: ${collection}`);
        }
        const interpolatedQueryFilter = this.interpolateObjectTemplate(filter, context);
        result = await QueryModel.find(interpolatedQueryFilter).limit(100).lean();
        break;

      default:
        throw new Error(`Unsupported database operation: ${operation}`);
    }

    return {
      data: {
        operation,
        collection,
        result: result ? (Array.isArray(result) ? result.length : 1) : 0,
        executed: true
      }
    };
  }

  /**
   * Execute notification action (using SNS topics or other notification services)
   * @param {object} actionConfig - Notification action configuration
   * @param {object} context - Execution context
   * @returns {Promise<object>} - Execution result
   */
  async executeNotificationAction(actionConfig, context) {
    const { topic, subject, message, target = 'sns' } = actionConfig.config;

    const interpolatedSubject = this.interpolateTemplate(subject, context);
    const interpolatedMessage = this.interpolateTemplate(message, context);

    let result;

    switch (target) {
      case 'sns':
        const params = {
          TopicArn: topic,
          Subject: interpolatedSubject,
          Message: interpolatedMessage
        };
        result = await this.sns.publish(params).promise();
        break;

      case 'database':
        // Store notification in database
        const notification = new DatabaseManager.schemas.Activity({
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'notification_sent',
          message: interpolatedMessage,
          status: 'info',
          details: interpolatedSubject
        });
        result = await notification.save();
        break;

      default:
        throw new Error(`Unsupported notification target: ${target}`);
    }

    return {
      data: {
        target,
        topic,
        subject: interpolatedSubject,
        message: interpolatedMessage,
        messageId: result.MessageId || result._id,
        sent: true
      }
    };
  }

  /**
   * Get email template
   * @param {string} templateName - Template name
   * @returns {Promise<object>} - Template data
   */
  async getEmailTemplate(templateName) {
    // This would typically fetch from a database or file system
    // For now, return some basic templates
    const templates = {
      'high-value-order': {
        text: 'High value order alert: {{order.total}} from customer {{customer.name}}',
        html: '<h3>High Value Order Alert</h3><p>Order Total: {{order.total}}</p><p>Customer: {{customer.name}}</p>'
      },
      'inventory-low': {
        text: 'Low inventory alert for product {{product.name}}: {{product.inventory}} remaining',
        html: '<h3>Low Inventory Alert</h3><p>Product: {{product.name}}</p><p>Remaining: {{product.inventory}}</p>'
      }
    };

    return templates[templateName] || null;
  }

  /**
   * Interpolate variables in template string
   * @param {string} template - Template string with {{variable}} placeholders
   * @param {object} context - Context with variables
   * @returns {string} - Interpolated string
   */
  interpolateTemplate(template, context) {
    if (!template || typeof template !== 'string') {
      return template;
    }

    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(context, path.trim());
      return value !== undefined && value !== null ? String(value) : match;
    });
  }

  /**
   * Interpolate variables in object template
   * @param {object} obj - Object with template strings
   * @param {object} context - Context with variables
   * @returns {object} - Interpolated object
   */
  interpolateObjectTemplate(obj, context) {
    if (typeof obj === 'string') {
      return this.interpolateTemplate(obj, context);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.interpolateObjectTemplate(item, context));
    }

    if (obj && typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.interpolateObjectTemplate(value, context);
      }
      return result;
    }

    return obj;
  }

  /**
   * Get nested value from object using dot notation
   * @param {object} obj - Object to get value from
   * @param {string} path - Dot notation path
   * @returns {any} - Value at path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

module.exports = ActionExecutor;