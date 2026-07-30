import {
  getSupabaseClient,
  isSupabaseConfigured,
} from "../supabase/supabaseClient";

const HASH_PATTERN = /^[a-f0-9]{64}$/;

function assertKeyHash(keyHash) {
  if (!HASH_PATTERN.test(keyHash)) {
    throw new Error("Identificador do Abrigo inválido.");
  }
}

function firstRow(data) {
  return Array.isArray(data) ? (data[0] ?? null) : (data ?? null);
}

async function callRpc(name, params) {
  try {
    const { data, error } = await getSupabaseClient().rpc(name, params);

    if (error) {
      throw new Error("remote");
    }

    return data;
  } catch {
    throw new Error("Não foi possível concluir a sincronização remota.");
  }
}

export const AbrigoRepository = {
  isAvailable() {
    return isSupabaseConfigured;
  },

  async createAbrigo(keyHash) {
    assertKeyHash(keyHash);
    return firstRow(await callRpc("create_abrigo", {
      p_key_hash: keyHash,
    }));
  },

  async findAbrigoByKeyHash(keyHash) {
    assertKeyHash(keyHash);
    return firstRow(await callRpc("find_abrigo_by_key_hash", {
      p_key_hash: keyHash,
    }));
  },

  async saveBackup(keyHash, backup) {
    assertKeyHash(keyHash);

    if (!backup || !Number.isInteger(backup.version) || backup.version < 1) {
      throw new Error("Backup inválido.");
    }

    const result = await callRpc("save_abrigo_backup", {
      p_key_hash: keyHash,
      p_version: backup.version,
      p_payload: backup,
    });

    if (result !== true) {
      throw new Error("Não foi possível confirmar o backup remoto.");
    }

    return true;
  },

  async getBackup(keyHash) {
    assertKeyHash(keyHash);
    return firstRow(await callRpc("get_abrigo_backup", {
      p_key_hash: keyHash,
    }));
  },

  async registerDevice(keyHash, device) {
    assertKeyHash(keyHash);

    if (!device?.id) {
      throw new Error("Dispositivo inválido.");
    }

    return firstRow(await callRpc("register_abrigo_device", {
      p_key_hash: keyHash,
      p_device_id: device.id,
      p_device_name: device.name || "Este dispositivo",
    }));
  },

  async updateLastSync(keyHash, deviceId, syncedAt) {
    assertKeyHash(keyHash);

    if (!deviceId || Number.isNaN(Date.parse(syncedAt))) {
      throw new Error("Dados de sincronização inválidos.");
    }

    const result = await callRpc("update_abrigo_last_sync", {
      p_key_hash: keyHash,
      p_device_id: deviceId,
      p_synced_at: syncedAt,
    });

    if (result !== true) {
      throw new Error("Não foi possível confirmar a sincronização.");
    }

    return true;
  },

  async rotateAbrigoKey(currentKeyHash, newKeyHash) {
    assertKeyHash(currentKeyHash);
    assertKeyHash(newKeyHash);

    if (currentKeyHash === newKeyHash) {
      throw new Error("Identificadores do Abrigo inválidos.");
    }

    const result = await callRpc("rotate_abrigo_key", {
      p_current_key_hash: currentKeyHash,
      p_new_key_hash: newKeyHash,
    });

    if (result !== true) {
      throw new Error("Não foi possível confirmar a troca da chave.");
    }

    return true;
  },
};

export default AbrigoRepository;
