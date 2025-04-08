import React, { useState } from 'react';

type SerializableType = string | number | boolean | null | SerializableObject | SerializableArray;

interface SerializableObject {
  [key: string]: SerializableType;
}

type SerializableArray = Array<SerializableType>;

export const Retool = {
  /**
   * Mock implementation of useStateBoolean
   */
  useStateBoolean: ({
    name,
    initialValue = false,
  }: {
    name: string;
    initialValue?: boolean;
    label?: string;
    description?: string;
    inspector?: 'text' | 'checkbox' | 'hidden';
  }) => {
    return useState<boolean>(initialValue) as readonly [boolean, (newValue: boolean) => void];
  },

  /**
   * Mock implementation of useStateNumber
   */
  useStateNumber: ({
    name,
    initialValue = 0,
  }: {
    name: string;
    initialValue?: number;
    label?: string;
    description?: string;
    inspector?: 'text' | 'hidden';
  }) => {
    return useState<number>(initialValue) as readonly [number, (newValue: number) => void];
  },

  /**
   * Mock implementation of useStateString
   */
  useStateString: ({
    name,
    initialValue = '',
  }: {
    name: string;
    initialValue?: string;
    label?: string;
    description?: string;
    inspector?: 'text' | 'hidden';
  }) => {
    return useState<string>(initialValue) as readonly [string, (newValue: string) => void];
  },

  /**
   * Mock implementation of useStateEnumeration
   */
  useStateEnumeration: <T extends string[]>({
    name,
    enumDefinition,
    initialValue,
  }: {
    name: string;
    initialValue?: T[number];
    enumDefinition: T;
    enumLabels?: {
      [K in T[number]]: string;
    };
    inspector?: 'segmented' | 'select' | 'hidden';
    description?: string;
    label?: string;
  }) => {
    // Use the first value as default if initialValue is not provided
    const defaultValue = initialValue || enumDefinition[0];
    return useState<T[number]>(defaultValue) as readonly [T[number], (newValue: T[number]) => void];
  },

  /**
   * Mock implementation of useStateObject
   */
  useStateObject: ({
    name,
    initialValue = {},
  }: {
    name: string;
    initialValue?: SerializableObject;
    inspector?: 'text' | 'hidden';
    description?: string;
    label?: string;
  }) => {
    return useState<SerializableObject>(initialValue) as readonly [SerializableObject, (newValue: SerializableObject) => void];
  },

  /**
   * Mock implementation of useStateArray
   */
  useStateArray: ({
    name,
    initialValue = [],
  }: {
    name: string;
    initialValue?: SerializableArray;
    inspector?: 'text' | 'hidden';
    description?: string;
    label?: string;
  }) => {
    return useState<SerializableArray>(initialValue) as readonly [SerializableArray, (newValue: SerializableArray) => void];
  },

  /**
   * Mock implementation of useEventCallback
   */
  useEventCallback: ({ name }: { name: string }) => {
    return () => {
      console.log(`Event callback "${name}" triggered`);
    };
  },

  /**
   * Mock implementation of useComponentSettings
   */
  useComponentSettings: ({
    defaultWidth,
    defaultHeight,
  }: {
    defaultWidth?: number;
    defaultHeight?: number;
  }) => {
    // This is a no-op in the mock implementation
    return;
  }
}; 