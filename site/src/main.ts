import '@fontsource-variable/sora';
import '@fontsource-variable/onest';
import '@fontsource-variable/noto-serif-sc';
import '@fontsource-variable/noto-sans-sc';
import '@fontsource-variable/chivo-mono';
import './styles/worlds.css';
import { qs, watchPerformance } from './env';
import { Story } from './story';

watchPerformance();

const host = qs(document, '#stage');
const live = qs(document, '#live');
const noscriptFallback = host.querySelector('[data-static-fallback]');
if (noscriptFallback) noscriptFallback.remove();

const story = new Story(host, live);
void story.start();
