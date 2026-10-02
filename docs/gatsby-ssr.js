export const onRenderBody = ({ setHeadComponents }) => {
    if (process.env.NODE_ENV === "production") {
        setHeadComponents([
            <script
                key="coi-serviceworker"
                src="/coi-serviceworker.js"
                defer
            />,
        ]);
    }
};
