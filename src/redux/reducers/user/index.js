import { HYDRATE } from 'next-redux-wrapper';
import {
  USER_LOADED, USER_NOT_AUTHENTICATED
} from 'redux/actionTypes/user';

import initialState from 'redux/reducers/user/initialState';
import userLoaded from 'redux/reducers/user/userLoaded';
import userNotAuthenticated from 'redux/reducers/user/userNotAuthenticated';

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    // case HYDRATE: {
    //   // Merge the server and client state
    //   // const nextState = {
    //   //   ...state, // Keep existing state (client)
    //   //   ...action.payload.user, // Apply delta from hydration (server)
    //   // };

    //   console.log("HYDRATING ...");

    //   // Preserve client-side isAuthenticated flag if already authenticated
    //   // if (state.isAuthenticated) {
    //   //   nextState.isAuthenticated = state.isAuthenticated;
    //   //   nextState.current = state.current;
    //   // }

    //   return nextState;
    // }
    case USER_LOADED: {
      return userLoaded(state, action);
    }
    case USER_NOT_AUTHENTICATED: {
      return userNotAuthenticated(state, action);
    }

    default: {
      return state;
    }
  }
};

export default userReducer;
