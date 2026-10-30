window.__errors = [];
window.addEventListener('error', e => window.__errors.push(e.message + ' @ ' + e.filename + ':' + e.lineno));
