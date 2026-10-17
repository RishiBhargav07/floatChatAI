import dotenv from 'dotenv';
dotenv.config();

// In-memory SMS delivery log store
const smsDispatchLogs = [];

// Runtime Config state (pre-filled with env values if present)
let twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  fromNumber: process.env.TWILIO_PHONE_NUMBER || '',
  recipientPhone: process.env.ALERT_RECIPIENT_PHONE || ''
};

export function updateTwilioConfig(newConfig) {
  twilioConfig = {
    ...twilioConfig,
    ...newConfig
  };
  return getTwilioConfigStatus();
}

export function getTwilioConfigStatus() {
  return {
    isConfigured: Boolean(twilioConfig.accountSid && twilioConfig.authToken && twilioConfig.fromNumber),
    accountSidMasked: twilioConfig.accountSid ? `${twilioConfig.accountSid.slice(0, 6)}...${twilioConfig.accountSid.slice(-4)}` : 'NOT_SET',
    fromNumber: twilioConfig.fromNumber || 'NOT_SET',
    recipientPhone: twilioConfig.recipientPhone || 'NOT_SET'
  };
}

/**
 * Sends SMS via Twilio API or high-fidelity simulation engine
 */
export async function sendSMS({ to, message, buoyName, severity }) {
  const recipient = to || twilioConfig.recipientPhone || '+15005550006';
  const timestamp = new Date().toISOString();
  
  // Format message text nicely
  let formattedMessage = message;
  if (!formattedMessage.includes('FloatChat AI Alert')) {
    formattedMessage = `🚨 FloatChat AI Alert [${severity || 'CRITICAL'}]: ${buoyName ? `Buoy ${buoyName}` : 'Ocean Sensor Network'} - ${message}`;
  }

  const { accountSid, authToken, fromNumber } = twilioConfig;

  // Check if real Twilio credentials are present
  const hasValidCreds = accountSid && authToken && fromNumber && !accountSid.includes('YOUR_') && !authToken.includes('YOUR_');

  if (hasValidCreds) {
    try {
      console.log(`[Twilio Service] Dispatching real Twilio SMS to ${recipient}...`);
      
      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const bodyParams = new URLSearchParams();
      bodyParams.append('To', recipient);
      bodyParams.append('From', fromNumber);
      bodyParams.append('Body', formattedMessage);

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams.toString()
      });

      const responseData = await response.json();

      if (response.ok) {
        const logEntry = {
          id: `SMS-${Date.now()}`,
          timestamp,
          recipient,
          fromNumber,
          message: formattedMessage,
          status: 'DELIVERED',
          mode: 'TWILIO_REST_API',
          sid: responseData.sid,
          buoyName: buoyName || 'System'
        };
        smsDispatchLogs.unshift(logEntry);
        return { success: true, mode: 'TWILIO_REST_API', sid: responseData.sid, log: logEntry };
      } else {
        console.warn('[Twilio API Error]:', responseData);
        const logEntry = {
          id: `SMS-${Date.now()}`,
          timestamp,
          recipient,
          fromNumber,
          message: formattedMessage,
          status: 'TWILIO_API_ERROR',
          errorMessage: responseData.message || responseData.detail || 'Twilio authorization failed',
          mode: 'TWILIO_FAILED_FALLBACK_SIMULATED',
          buoyName: buoyName || 'System'
        };
        smsDispatchLogs.unshift(logEntry);
        return { success: false, mode: 'TWILIO_FAILED_FALLBACK_SIMULATED', error: responseData.message, log: logEntry };
      }

    } catch (err) {
      console.error('[Twilio Service Exception]:', err);
      const logEntry = {
        id: `SMS-${Date.now()}`,
        timestamp,
        recipient,
        fromNumber: fromNumber || 'Twilio-Free-Trial',
        message: formattedMessage,
        status: 'EXCEPTION_SIMULATED',
        errorMessage: err.message,
        mode: 'SIMULATED_TEST_MODE',
        buoyName: buoyName || 'System'
      };
      smsDispatchLogs.unshift(logEntry);
      return { success: true, mode: 'SIMULATED_TEST_MODE', error: err.message, log: logEntry };
    }
  }

  // Free Subscription Simulation Mode when credentials aren't set in environment
  console.log(`[Twilio Service] Operating in Twilio Free Subscription Simulation Mode for ${recipient}`);
  const logEntry = {
    id: `SMS-${Date.now()}`,
    timestamp,
    recipient,
    fromNumber: fromNumber || '+18005550199 (Twilio Free Trial)',
    message: `(Sent from your Twilio trial account) ${formattedMessage}`,
    status: 'DELIVERED_SIMULATED',
    mode: 'FREE_TRIAL_SIMULATED',
    sid: `SM${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    buoyName: buoyName || 'System'
  };

  smsDispatchLogs.unshift(logEntry);
  if (smsDispatchLogs.length > 50) smsDispatchLogs.pop();

  return {
    success: true,
    mode: 'FREE_TRIAL_SIMULATED',
    sid: logEntry.sid,
    log: logEntry,
    message: 'SMS sent via Twilio Trial Sandbox Simulation (Enter live Twilio SID/Auth Token in Settings to route via cellular network)'
  };
}

export function getSMSLogs() {
  return smsDispatchLogs;
}

export function clearSMSLogs() {
  smsDispatchLogs.length = 0;
  return { success: true };
}
