import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router";
import { Provider } from "react-redux";
import { createBrowserHistory } from "history";

import store from "./store";
import App from "./components/App";

const historyType: any = createBrowserHistory();

ReactDOM.render(
	<Router history={historyType}>
		<Provider store={store}>
			<App />
		</Provider>
	</Router>,
	document.getElementById("root")
);
