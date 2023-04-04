// These are util functions to convert JSON to Firestore format through recurrsion. Written painfully by Zack from scratch.

export class Geopoint {
  constructor(public latitude: number, public longitude: number) {}
}

export class Reference {
  constructor(public path: string) {}
}

export type FirestoreFormattedObject = {
  [x: string]: FirestoreFormattedValue;
};

export type FirestoreFormattedValue = {
  stringValue?: string;
  integerValue?: number | string;
  doubleValue?: number | string;
  booleanValue?: boolean;
  nullValue?: null;
  timestampValue?: string;
  referenceValue?: string;
  geoPointValue?: {
    latitude: number;
    longitude: number;
  };
  arrayValue?: {
    values: FirestoreFormattedValue[];
  };
  mapValue?: {
    fields: {
      [x: string]: FirestoreFormattedValue;
    };
  };
};

export type FirestoreObject =
  | string
  | number
  | boolean
  | null
  | Geopoint
  | Reference
  | Date
  | { [x: string]: FirestoreObject }
  | Array<FirestoreObject>;

function jsonToFirestoreHelper(json: FirestoreObject): FirestoreFormattedValue {
  if (json instanceof Geopoint) {
    return {
      geoPointValue: {
        latitude: json.latitude,
        longitude: json.longitude,
      },
    };
  }

  if (json instanceof Reference) {
    return { referenceValue: json.path };
  }

  if (json instanceof Date) {
    return { timestampValue: json.toISOString() };
  }

  if (typeof json === 'object' && json !== null) {
    if (Array.isArray(json)) {
      return { arrayValue: { values: json.map(jsonToFirestoreHelper) } };
    } else {
      return {
        mapValue: {
          fields: {
            ...Object.entries(json).reduce((acc: any, [key, value]) => {
              acc[key] = jsonToFirestoreHelper(value);
              return acc;
            }, {}),
          },
        },
      };
    }
  }

  if (typeof json === 'string') {
    return { stringValue: json };
  }

  if (typeof json === 'number') {
    if (Number.isInteger(json)) return { integerValue: json };
    return { doubleValue: json };
  }

  if (typeof json === 'boolean') {
    return { booleanValue: json };
  }

  return { nullValue: null };
}

export function jsonToFirestore(
  json: FirestoreObject
): FirestoreFormattedObject {
  return jsonToFirestoreHelper(json)?.mapValue?.fields ?? {};
}

function firestoreToJsonHelper(
  firestore: FirestoreFormattedValue
): FirestoreObject {
  if (firestore.stringValue) {
    return firestore.stringValue;
  }

  if (firestore.integerValue) {
    if (typeof firestore.integerValue === 'string') {
      return parseInt(firestore.integerValue);
    }
    return firestore.integerValue;
  }

  if (firestore.doubleValue) {
    if (typeof firestore.doubleValue === 'string') {
      return parseFloat(firestore.doubleValue);
    }
    return firestore.doubleValue;
  }

  if (firestore.booleanValue) {
    return firestore.booleanValue;
  }

  if (firestore.nullValue) {
    return null;
  }

  if (firestore.timestampValue) {
    return new Date(firestore.timestampValue);
  }

  if (firestore.referenceValue) {
    return new Reference(firestore.referenceValue);
  }

  if (firestore.geoPointValue) {
    return new Geopoint(
      firestore.geoPointValue.latitude,
      firestore.geoPointValue.longitude
    );
  }

  if (firestore.arrayValue) {
    return firestore.arrayValue.values.map(firestoreToJsonHelper);
  }

  if (firestore.mapValue) {
    return Object.entries(firestore.mapValue.fields).reduce(
      (acc: any, [key, value]) => {
        acc[key] = firestoreToJsonHelper(value);
        return acc;
      },
      {}
    );
  }

  return null;
}

export function firestoreToJson(
  firestore: FirestoreFormattedObject
): FirestoreObject {
  return firestoreToJsonHelper({ mapValue: { fields: firestore } });
}
