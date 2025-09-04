export class ConfirmDialogModel {

  constructor(public title: string, public message: string, public color: string) {
  }
}

export interface AutorisationData {
  role: string;
  id: string;
}

export interface ConnexionData {
  appareil: string;
  ipadress: string;
  connectionId: string;
}

export interface DossierData {
  id: string;
  datedevi: Date;
  fosaId: string;
  description: string;
  numpurchaseorder: string;
  datepurchaseorder: Date;
  poids: number;
  totalmontantUnitaire: number;
  nbrmanutention: number;
  totalmontantmanutention: number;
  totalmontanttransit: number;
  totalmontantprefinencement: number;
  tvapourcentage: number;
  commissionpourcentage: number;
  assurance: number;
  tarif_categorie: number;
  tarif_unite: number;
  // tarif_minimale: number;
  tarif_montantMinimale: number;
  tarif_montantUnitaire: number;
  tarif_origine: string;
  tarif_destination: string;
  tarif_transit: string;
  tarif_montantmanutention: number;
  tarif_montanttransit: number;
}

export interface ManifesteData {
  id: string;
  appareilId: string;
}

export interface ParametreData {
  id: string;
  type: string;
  key: string;
  value: string;
}
