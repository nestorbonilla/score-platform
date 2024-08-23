'use server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
const client = twilio(accountSid, authToken);
  
export async function sendVerificationCode(phone: string) {
  
  try {
    const verification = await client.verify.v2
      .services(serviceSid!)
      .verifications.create({
        channel: 'sms',
        to: phone,
      });

    return { success: true, sid: verification.sid };
  } catch (error) {
    console.error('Error sending SMS verification:', error);
    return { error: 'Failed to send verification', status: 500 };
  }
}

export async function checkVerificationCode(phone: string, code: string) {
  try {
    const verificationCheck = await client.verify.v2
      .services(serviceSid!)
      .verificationChecks.create({
        to: phone,
        code: code,
      });

    return { success: verificationCheck.status === 'approved' };
  } catch (error) {
    console.error('Error checking verification code:', error);
    return { error: 'Failed to check verification', status: 500 };
  }
}