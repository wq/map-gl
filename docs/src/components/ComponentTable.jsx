import {
    Table,
    TableBody,
    TableCell,
    TableTitle,
    TableHead,
    TableRow,
    Link,
} from "@wq/material";
import { usePages } from "@wq/gatsby-components";

export default function ComponentTable({
    folderTitle,
    componentFile = (page) => page.title,
    componentFolder = () => "components",
    isBase = () => false,
}) {
    const folder = usePages()
        .find((s) => s.name === "Component API")
        ?.pages.find((s) => s.title === folderTitle);
    const pages = folder
        ? folder.pages.filter((page) => page.url !== folder.url)
        : [];
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableTitle>Component</TableTitle>
                    <TableTitle>@wq/map</TableTitle>
                    <TableTitle>@wq/map-gl-web</TableTitle>
                    <TableTitle>@wq/map-gl-native</TableTitle>
                </TableRow>
            </TableHead>
            <TableBody>
                {pages.map((page) => (
                    <TableRow key={page.title}>
                        <TableCell>
                            <Link to={page.url}>{page.title}</Link>
                        </TableCell>
                        {isBase(page) ? (
                            <>
                                <TableCell>
                                    <Link
                                        href={getUrl(
                                            componentFile(page),
                                            "map",
                                            componentFolder(page),
                                        )}
                                    >
                                        Base
                                    </Link>
                                </TableCell>
                                <TableCell />
                                <TableCell />
                            </>
                        ) : (
                            <>
                                <TableCell />
                                <TableCell>
                                    <Link
                                        href={getUrl(
                                            componentFile(page),
                                            "map-gl-web",
                                            componentFolder(page),
                                        )}
                                    >
                                        Web
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Link
                                        href={getUrl(
                                            componentFile(page),
                                            "map-gl-native",
                                            componentFolder(page),
                                        )}
                                    >
                                        Native
                                    </Link>
                                </TableCell>
                            </>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function getUrl(name, module, folder) {
    return `https://github.com/wq/map-gl/blob/main/packages/${module}/src/${folder}/${name}.js`;
}
