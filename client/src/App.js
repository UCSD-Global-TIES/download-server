import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import API from './utils/API';
import "./App.css";

import SocketContext from './socket-context'
import * as io from 'socket.io-client'

const socket = io()


function App() {

  useEffect(() => {
  }, []);

  

  return (
        <SocketContext.Provider value={socket}>

      <div className="App">
        <header>
          {/* Place navigation bar here */}
        </header>
        {/* <Switch>
          <Route exact path="/" component={Landing} />
          <PrivateRoute exact path="/private-page" component={PrivatePage} user={userInfo}/>
          <Route component={NoMatch} />
        </Switch> */}
      </div>
      </SocketContext.Provider>
  );
}

export default App;
