// These are util functions to convert JSON to Firestore format through recurrsion. Written painfully by Zack from scratch.

export class Geopoint {
  constructor(public latitude: number, public longitude: number) {}
}

export class Reference {
  constructor(public path: string) {}
}

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | Geopoint
  | Reference
  | Date
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export function jsonToFirestoreHelper(json: JSONValue): any {
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

export function jsonToFirestore(json: JSONValue): any {
  return jsonToFirestoreHelper(json).mapValue.fields;
}
