import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router";
import HomePage from "./components/HomePage";

export function renderHomePage(): string {
    return ReactDOMServer.renderToString(
        <StaticRouter location="/">
            <HomePage
                onOpenAuth={() => {}}
                isAuthenticated={false}
            />
        </StaticRouter>,
    );
}

