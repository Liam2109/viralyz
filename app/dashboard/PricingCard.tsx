// Mise à jour de la carte de tarification
// Affichage des nouveaux plans et crédits

import React from 'react';

const PricingCard = () => {
  return (
    <div style={{ backgroundColor: 'black', color: 'white' }}>
      <h1>Tarification</h1>
      <div>
        <h2>Plan FREE</h2>
        <p>2 analyses/mois, analyse basique</p>
      </div>
      <div>
        <h2>Plan CREATOR</h2>
        <p>19.99€ : 50 analyses/mois, analyse complète</p>
      </div>
      <div>
        <h2>Plan PRO</h2>
        <p>39.99€ : 30 analyses ultra-détaillées/mois, tout inclus, résultats 3x plus précis</p>
      </div>
    </div>
  );
};

export default PricingCard;

// Garde tous les styles existants
// Ne casse aucun fichier existant
// Sauvegarde tout