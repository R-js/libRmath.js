import { HumanizeDuration, HumanizeDurationLanguage } from 'humanize-duration-ts';

const lang = new HumanizeDurationLanguage();
const humanize = new HumanizeDuration(lang);

export { humanize };
