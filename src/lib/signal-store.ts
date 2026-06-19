import localforage from "localforage";
import {
  StorageType,
  Direction,
  KeyPairType,
  SessionRecordType,
} from "@privacyresearch/libsignal-protocol-typescript";

export class SignalProtocolStore implements StorageType {
  private store: LocalForage;

  constructor() {
    this.store = localforage.createInstance({
      name: "MyDuolingoSignalStore",
      storeName: "signal_keys_sessions",
    });
  }

  // Use a simple util to convert ArrayBuffer to string for IDB keys where needed
  private buf2hex(buffer: ArrayBuffer) {
    return Array.prototype.map
      .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
      .join("");
  }

  async getIdentityKeyPair(): Promise<KeyPairType | undefined> {
    const kp = await this.store.getItem<KeyPairType>("identityKey");
    return kp || undefined;
  }

  async getLocalRegistrationId(): Promise<number | undefined> {
    const id = await this.store.getItem<number>("registrationId");
    return id || undefined;
  }

  async isTrustedIdentity(
    identifier: string,
    identityKey: ArrayBuffer,
    direction: Direction,
  ): Promise<boolean> {
    if (!identifier) {
      throw new Error("tried to check identity key for undefined/null key");
    }
    const trusted = await this.store.getItem<ArrayBuffer>(
      "identityKey" + identifier,
    );
    if (trusted === null) {
      return true;
    }
    return this.buf2hex(trusted) === this.buf2hex(identityKey);
  }

  async saveIdentity(
    encodedAddress: string,
    publicKey: ArrayBuffer,
    nonblockingApproval?: boolean,
  ): Promise<boolean> {
    if (!encodedAddress)
      throw new Error("tried to save identity key for undefined/null key");

    const existing = await this.store.getItem<ArrayBuffer>(
      "identityKey" + encodedAddress,
    );
    await this.store.setItem("identityKey" + encodedAddress, publicKey);

    if (existing && this.buf2hex(existing) !== this.buf2hex(publicKey)) {
      return true;
    }
    return false;
  }

  async loadPreKey(
    encodedAddress: string | number,
  ): Promise<KeyPairType | undefined> {
    const res = await this.store.getItem<KeyPairType>(
      "25519KeypreKey" + encodedAddress,
    );
    return res || undefined;
  }

  async storePreKey(
    keyId: number | string,
    keyPair: KeyPairType,
  ): Promise<void> {
    await this.store.setItem("25519KeypreKey" + keyId, keyPair);
  }

  async removePreKey(keyId: number | string): Promise<void> {
    await this.store.removeItem("25519KeypreKey" + keyId);
  }

  async storeSession(
    encodedAddress: string,
    record: SessionRecordType,
  ): Promise<void> {
    await this.store.setItem("session" + encodedAddress, record);
  }

  async loadSession(
    encodedAddress: string,
  ): Promise<SessionRecordType | undefined> {
    const res = await this.store.getItem<SessionRecordType>(
      "session" + encodedAddress,
    );
    return res || undefined;
  }

  async loadSignedPreKey(
    keyId: number | string,
  ): Promise<KeyPairType | undefined> {
    const res = await this.store.getItem<KeyPairType>(
      "25519KeysignedKey" + keyId,
    );
    return res || undefined;
  }

  async storeSignedPreKey(
    keyId: number | string,
    keyPair: KeyPairType,
  ): Promise<void> {
    await this.store.setItem("25519KeysignedKey" + keyId, keyPair);
  }

  async removeSignedPreKey(keyId: number | string): Promise<void> {
    await this.store.removeItem("25519KeysignedKey" + keyId);
  }

  // --- Utility methods for app setup ---

  async putIdentityKey(keyPair: KeyPairType): Promise<void> {
    await this.store.setItem("identityKey", keyPair);
  }

  async putLocalRegistrationId(registrationId: number): Promise<void> {
    await this.store.setItem("registrationId", registrationId);
  }

  // Save plaintext for messages WE send, because we can't decrypt them from the DB
  // (they are encrypted for the receiver's keys, not ours)
  async storeSentMessagePlaintext(
    ciphertext: string,
    plaintext: string,
  ): Promise<void> {
    // We can use a hash or just the ciphertext as the key.
    // For simplicity, we use the first 50 chars of ciphertext as key to avoid huge keys
    const key = "sent_msg_" + ciphertext.substring(0, 50);
    await this.store.setItem(key, plaintext);
  }

  async getSentMessagePlaintext(
    ciphertext: string,
  ): Promise<string | undefined> {
    const key = "sent_msg_" + ciphertext.substring(0, 50);
    const res = await this.store.getItem<string>(key);
    return res || undefined;
  }

  async clearStore(): Promise<void> {
    await this.store.clear();
  }
}
