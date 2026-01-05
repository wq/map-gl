import React from "react";
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
import { Info, Javascript as NpmPackage } from "@mui/icons-material";
import "./styles.css";

const config = {
    site_title: "@wq/map-gl",
    logo: "https://wq.io/images/icons/wq.svg",
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
