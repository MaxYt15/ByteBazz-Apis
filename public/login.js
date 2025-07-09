// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCR0pZ05ouTScwY8c90BQP4LCyQrHsaK6Q",
  authDomain: "bytebazz-apis.firebaseapp.com",
  projectId: "bytebazz-apis",
  storageBucket: "bytebazz-apis.firebasestorage.app",
  messagingSenderId: "480135965859",
  appId: "1:480135965859:web:40567753bc972fe7182316",
  measurementId: "G-MYS6QLP6K6"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const auth = firebase.auth();
const db = firebase.database();

function generarApiKeySeguro(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

document.getElementById('google-login').onclick = async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    const displayName = user.displayName || user.email.split('@')[0];
    // Verificar si el usuario ya tiene API key
    const dbKey = displayName.replace(/\s+/g, '_');
    const userRef = db.ref('usuarios/' + dbKey);
    userRef.once('value').then(snapshot => {
      let apiKey = snapshot.val() && snapshot.val().apiKey;
      function asignarApiKeyUnica(callback) {
        const tryKey = generarApiKeySeguro(32);
        db.ref('usuarios').orderByChild('apiKey').equalTo(tryKey).once('value').then(snapshotKey => {
          if (snapshotKey.exists()) {
            // Ya existe, intenta otra
            asignarApiKeyUnica(callback);
          } else {
            callback(tryKey);
          }
        });
      }

      if (!apiKey) {
        asignarApiKeyUnica(function(apiKeyFinal) {
          userRef.set({
            nombre: displayName,
            correo: user.email,
            foto: user.photoURL,
            apiKey: apiKeyFinal
          });
        });
      } else {
        userRef.set({
          nombre: displayName,
          correo: user.email,
          foto: user.photoURL,
          apiKey: apiKey
        });
      }
    });
    document.getElementById('login-status').innerHTML = `<b>¡Bienvenido, ${displayName}!</b> Redirigiendo al panel...`;
    setTimeout(() => {
      window.location.href = 'panel.html';
    }, 1200);
  } catch (e) {
    document.getElementById('login-status').innerHTML = `<span style='color:red'>Error: ${e.message}</span>`;
  }
}; 