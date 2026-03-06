interface TemplateContext {
  userName?: string;
  innName?: string;
  isBloodRelated?: boolean;
}

const RELATIONSHIP_BLOOD = '亲生姐姐';
const RELATIONSHIP_NON_BLOOD = '义姐';

export const applyPlayerTextTemplate = (text: string, context: TemplateContext): string => {
  if (!text) return '';

  const userName = context.userName ?? '{{user}}';
  const innName = context.innName ?? '{{home}}';
  const relationship = context.isBloodRelated === false ? RELATIONSHIP_NON_BLOOD : RELATIONSHIP_BLOOD;

  return text
    .replace(/{{user}}/g, userName)
    .replace(/{{home}}/g, innName)
    .replace(/{{user_relationship}}/g, relationship);
};

export const resolveCharacterDisplayName = (rawName: string, userName: string): string => {
  return applyPlayerTextTemplate(rawName, { userName });
};
