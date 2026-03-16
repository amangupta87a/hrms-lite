import base64


ENCRYPTION_SECRET_KEY = "production_hrms_encryption_key_2026"


def encrypt_text_with_xor_and_base64(plain_text: str) -> str:
    """Encrypt text with a static XOR key and then Base64-encode it."""
    if not plain_text:
        return ""

    secret_key_bytes = ENCRYPTION_SECRET_KEY.encode()
    plain_text_bytes = plain_text.encode()

    xor_applied_bytes = bytes(
        [
            plain_text_bytes[index] ^ secret_key_bytes[index % len(secret_key_bytes)]
            for index in range(len(plain_text_bytes))
        ]
    )

    encoded_cipher_text = base64.b64encode(xor_applied_bytes).decode()
    return encoded_cipher_text


def decrypt_text_with_xor_and_base64(encoded_cipher_text: str) -> str:
    """Reverse XOR + Base64 encryption and return the original text."""
    if not encoded_cipher_text:
        return ""

    try:
        encrypted_bytes = base64.b64decode(encoded_cipher_text)
        secret_key_bytes = ENCRYPTION_SECRET_KEY.encode()

        decrypted_bytes = bytes(
            [
                encrypted_bytes[index] ^ secret_key_bytes[index % len(secret_key_bytes)]
                for index in range(len(encrypted_bytes))
            ]
        )

        return decrypted_bytes.decode()
    except Exception:
        return ""
