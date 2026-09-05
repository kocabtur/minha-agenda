const LABELS = {
  disabled: { text: 'Somente local', title: 'Configure o Supabase para sincronizar entre aparelhos.' },
  syncing: { text: 'Sincronizando...', title: 'Enviando/recebendo dados do Supabase.' },
  synced: { text: 'Sincronizado', title: 'Dados atualizados com o Supabase.' },
  offline: { text: 'Offline', title: 'Sem conexão — as alterações serão enviadas ao Supabase quando a internet voltar.' },
  error: { text: 'Erro de sincronização', title: 'Não foi possível sincronizar com o Supabase agora. Os dados continuam salvos localmente.' },
};

export default function SyncStatus({ state }) {
  const info = LABELS[state] ?? LABELS.disabled;
  return (
    <span className={`sync-status sync-status--${state}`} title={info.title}>
      <span className="sync-status__dot" />
      {info.text}
    </span>
  );
}
