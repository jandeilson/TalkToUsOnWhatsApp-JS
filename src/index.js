import logMessage from './js/logger'
import 'bootstrap';
import './scss/style.scss';
import './css/style.css'

// Log message to console
logMessage('Its finished!!')

if (module.hot)       // eslint-disable-line no-undef
  module.hot.accept() // eslint-disable-line no-undef