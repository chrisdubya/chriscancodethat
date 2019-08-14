import ready from 'domready';
import '../scss/app.scss';

import App from './App';

ready(() => {
	window.app = new App();
	window.app.init();
});
