import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as nacl from "https://esm.sh/tweetnacl@1.0.3";
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64,
} from "https://esm.sh/tweetnacl-util@0.15.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Server-side ChaCha20-Poly1305 encryption service
 * Supports encryption, decryption, and signature operations
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation, data, key, signature, publicKey, message } = await req.json();

    console.log('Encryption operation requested:', operation);

    switch (operation) {
      case 'encrypt': {
        if (!data || !key) {
          return new Response(
            JSON.stringify({ error: 'Data and key are required for encryption' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const keyUint8 = decodeBase64(key);
        const nonce = nacl.randomBytes(24);
        const messageUint8 = decodeUTF8(data);
        const encrypted = nacl.secretbox(messageUint8, nonce, keyUint8);
        
        const fullMessage = new Uint8Array(nonce.length + encrypted.length);
        fullMessage.set(nonce);
        fullMessage.set(encrypted, nonce.length);
        
        const encryptedData = encodeBase64(fullMessage);
        console.log('Data encrypted successfully');

        return new Response(
          JSON.stringify({ encryptedData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'decrypt': {
        if (!data || !key) {
          return new Response(
            JSON.stringify({ error: 'Data and key are required for decryption' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const keyUint8 = decodeBase64(key);
        const fullMessage = decodeBase64(data);
        
        const nonce = fullMessage.slice(0, 24);
        const ciphertext = fullMessage.slice(24);
        
        const decrypted = nacl.secretbox.open(ciphertext, nonce, keyUint8);
        
        if (!decrypted) {
          return new Response(
            JSON.stringify({ error: 'Decryption failed - invalid key or corrupted data' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const decryptedData = encodeUTF8(decrypted);
        console.log('Data decrypted successfully');

        return new Response(
          JSON.stringify({ decryptedData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sign': {
        if (!message || !key) {
          return new Response(
            JSON.stringify({ error: 'Message and secret key are required for signing' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const secretKey = decodeBase64(key);
        const messageUint8 = decodeUTF8(message);
        const signatureBytes = nacl.sign.detached(messageUint8, secretKey);
        const signatureBase64 = encodeBase64(signatureBytes);
        
        console.log('Message signed successfully');

        return new Response(
          JSON.stringify({ signature: signatureBase64 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'verify': {
        if (!message || !signature || !publicKey) {
          return new Response(
            JSON.stringify({ error: 'Message, signature, and public key are required for verification' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const messageUint8 = decodeUTF8(message);
        const signatureUint8 = decodeBase64(signature);
        const publicKeyUint8 = decodeBase64(publicKey);
        
        const isValid = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
        
        console.log('Signature verification:', isValid ? 'valid' : 'invalid');

        return new Response(
          JSON.stringify({ valid: isValid }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'generateKey': {
        const key = nacl.randomBytes(32);
        const keyBase64 = encodeBase64(key);
        
        console.log('New encryption key generated');

        return new Response(
          JSON.stringify({ key: keyBase64 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'generateKeyPair': {
        const keyPair = nacl.sign.keyPair();
        const publicKeyBase64 = encodeBase64(keyPair.publicKey);
        const secretKeyBase64 = encodeBase64(keyPair.secretKey);
        
        console.log('New key pair generated');

        return new Response(
          JSON.stringify({ 
            publicKey: publicKeyBase64,
            secretKey: secretKeyBase64
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation. Supported: encrypt, decrypt, sign, verify, generateKey, generateKeyPair' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in encrypt-data function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
