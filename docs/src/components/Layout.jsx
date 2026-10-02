import {
    Root,
    Container,
    Header,
    Main,
    Footer,
    NavMenuFixed,
} from "@wq/material";
import {
    NavMenu,
    Content,
    usePageTitle,
    useNav,
    useReverse,
    useRouteInfo,
    useBreadcrumbs,
} from "@wq/gatsby-components";
import { Link } from "gatsby";

import Info from "@mui/icons-material/Info";
import NpmPackage from "@mui/icons-material/Javascript";
import Code from "@mui/icons-material/Code";

import Index from "@mui/icons-material/List";
import Map from "@mui/icons-material/Map";
import Layers from "@mui/icons-material/Layers";
import Toolbar from "@mui/icons-material/Tune";
import Highlight from "@mui/icons-material/HighlightAlt";

import "./styles.css";

const config = {
    site_title: "@wq/map-gl",
    logo: "/images/icons/wq.svg",
};

const components = {
    NavLink: Link,
    NavMenu,
    useNav,
    useReverse,
    useRouteInfo,
    useBreadcrumbs,
};

const icons = {
    Info,
    NpmPackage,
    Code,
    Index,
    Map,
    Layers,
    Toolbar,
    Highlight,
};

const overrides = { config, components, icons };

const theme = {
    primary: "#7500ae",
    secondary: "#0088bd",
};

export default function Layout({ children }) {
    return (
        <Root wq={overrides} theme={theme}>
            <Container>
                <Header />
                <Main>
                    <NavMenuFixed />
                    <Content>{children}</Content>
                </Main>
                <Footer />
            </Container>
        </Root>
    );
}

export function Head() {
    const pageTitle = usePageTitle();
    return (
        <>
            <title>
                {pageTitle} - {overrides.config.site_title}
            </title>
        </>
    );
}
