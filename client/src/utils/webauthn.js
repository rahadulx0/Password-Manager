import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

const API_URL = import.meta.env.VITE_API_URL || '';

export async function isBiometricAvailable() {
  try {
    if (!window.PublicKeyCredential) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function registerBiometric(token) {
  const optionsRes = await fetch(`${API_URL}/api/user/webauthn/register-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!optionsRes.ok) throw new Error((await optionsRes.json()).message);
  const options = await optionsRes.json();

  const attestation = await startRegistration({ optionsJSON: options });

  const verifyRes = await fetch(`${API_URL}/api/user/webauthn/register-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(attestation),
  });
  const result = await verifyRes.json();
  if (!verifyRes.ok) throw new Error(result.message);
  return result;
}

export async function authenticateBiometric(token) {
  const optionsRes = await fetch(`${API_URL}/api/user/webauthn/auth-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!optionsRes.ok) throw new Error((await optionsRes.json()).message);
  const options = await optionsRes.json();

  const assertion = await startAuthentication({ optionsJSON: options });

  const verifyRes = await fetch(`${API_URL}/api/user/webauthn/auth-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(assertion),
  });
  const result = await verifyRes.json();
  if (!verifyRes.ok) throw new Error(result.message);
  return result;
}

export async function disableBiometric(token) {
  const res = await fetch(`${API_URL}/api/user/webauthn`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
}
