/* ==========================================================================
   QuizVerse — worker de synthèse audio
   --------------------------------------------------------------------------
   La génération d'une piste musicale demande environ 1,5 s de calcul.
   Elle est donc exécutée ici, hors du fil principal, pour que l'interface
   reste parfaitement fluide même au premier changement de musique.

   Ce worker ne dépend que de js/audio.js (importé tel quel) et ne touche
   à rien d'autre. Il n'est utilisé que si le navigateur l'accepte ; sinon
   QuizVerse bascule sur un rendu étalé.
   ========================================================================== */
'use strict';

/* global importScripts, QV */
importScripts('./audio.js');

self.onmessage = function (event) {
  const id = event && event.data ? event.data.id : null;
  if (!id) return;
  let data = null;
  try {
    data = QV.audio.renderTrack(id);
  } catch (err) {
    self.postMessage({ id: id, ok: false });
    return;
  }
  if (!data || !data.length) {
    self.postMessage({ id: id, ok: false });
    return;
  }
  // Le moteur garde sa piste en cache : on envoie une copie transférable,
  // sinon le buffer serait déjà détaché lors d'une seconde demande.
  const copy = new Float32Array(data.length);
  copy.set(data);
  self.postMessage({ id: id, ok: true, buffer: copy.buffer, length: copy.length }, [copy.buffer]);
};
