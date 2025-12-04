export const agentTranslations: Record<string, string> = {
  'Jett': 'Jett',
  'Phoenix': 'Phoenix',
  'Sage': 'Sage',
  'Sova': 'Sova',
  'Viper': 'Viper',
  'Cypher': 'Cypher',
  'Reyna': 'Reyna',
  'Killjoy': 'Killjoy',
  'Breach': 'Breach',
  'Omen': 'Omen',
  'Brimstone': 'Brimstone',
  'Raze': 'Raze',
  'Skye': 'Skye',
  'Yoru': 'Yoru',
  'Astra': 'Astra',
  'KAY/O': 'KAY/O',
  'Chamber': 'Chamber',
  'Neon': 'Neon',
  'Fade': 'Fade',
  'Harbor': 'Harbor',
  'Gekko': 'Gekko',
  'Deadlock': 'Deadlock',
  'Iso': 'Iso',
  'Clove': 'Clove'
};

export const roleTranslations: Record<string, string> = {
  'Duelist': 'Duelista',
  'Controller': 'Controlador',
  'Initiator': 'Iniciador',
  'Sentinel': 'Sentinela'
};

export function translateAgent(agentName: string): string {
  return agentTranslations[agentName] || agentName;
}

export function translateRole(roleName: string): string {
  return roleTranslations[roleName] || roleName;
}
