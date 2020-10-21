import React, { useReducer, useState } from 'react';
import produce from 'immer';
import { remove, findIndex } from 'lodash';

const requestKey = (() => {
  let key = 0;
  // eslint-disable-next-line no-plusplus
  return () => key++;
})();
function reducer(state, action) {
  switch (action.type) {
    case 'INIT': {
      return action.payload;
    }
    case 'ADD': {
      return produce(state, (draft) => {
        draft.push(action.payload);
      });
    }
    case 'REMOVE': {
      return produce(state, (draft) => {
        remove(draft, { key: action.payload });
      });
    }
    case 'SET': {
      return produce(state, (draft) => {
        const index = findIndex(draft, { key: action.payload.key });
        // eslint-disable-next-line no-param-reassign
        draft[index] = {
          key: action.payload.key,
          ...action.payload.value,
        };
      });
    }
    default: throw new Error();
  }
}

const initialState = [];
function useFields() {
  const [fields, dispatch] = useReducer(reducer, initialState);
  const init = (data) => {
    const initFields = data.map((item) => ({
      key: requestKey(),
      ...item,
    }));
    dispatch({
      type: 'INIT',
      payload: initFields,
    });
    return initFields;
  };
  const add = () => {
    const key = requestKey();
    dispatch({
      type: 'ADD',
      payload: { key },
    });
    return key;
  };
  const removeField = (key) => {
    dispatch({
      type: 'REMOVE',
      payload: key,
    });
  };
  const set = (key, value) => {
    dispatch({
      type: 'SET',
      payload: { key, value },
    });
  };
  return [fields, {
    add, remove: removeField, set, init,
  }];
}
export default useFields;
