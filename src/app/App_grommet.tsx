import { useState, useContext } from "react";
import {
    Box,
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Form,
    FormField,
    Grid,
    Grommet,
    grommet,
    Header,
    Heading,
    Image,
    Page,
    PageContent,
    PageHeader,
    Paragraph,
    Text,
    TextInput,
    ResponsiveContext,
} from "grommet";
import { deepMerge } from "grommet/utils";
import { Moon, Sun } from "grommet-icons";

const theme = deepMerge(grommet, {
    global: {
        colors: {
            brand: '#228BE6',
        },
        font: {
            family: "Roboto",
            size: "18px",
            height: "20px",
        },
    },
});

const AppBar = (props: any) => (
    <Header
        background="brand"
        pad={{ left: "medium", right: "small", vertical: "small" }}
        elevation="medium"
        {...props}
    />
);

const CurrenciesForm = () => {
    const [value, setValue] = useState({});
    return (
        <Form
            value={value}
            onChange={nextValue => setValue(nextValue)}
            onReset={() => setValue({})}
            onSubmit={({ value }) => { }}
        >
            <FormField name="rate_from" htmlFor="text-input-id" label="From">
                <TextInput size="medium" id="rate_from" name="rate_from" />
            </FormField>
            <Box direction="row" gap="medium">
                <Button type="submit" primary label="Submit" />
                <Button type="reset" label="Reset" />
            </Box>
        </Form>
    );
}

const AppGrommet = () => {
    const [dark, setDark] = useState(false);
    {
        return (
            <Grommet theme={theme} full themeMode={dark ? "dark" : "light"}>
                <Page kind="narrow">
                    <AppBar>
                        <Text size="medium">Currencies Calculator</Text>
                        <Button
                            a11yTitle={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            icon={dark ? <Moon /> : <Sun />}
                            onClick={() => setDark(!dark)}
                            tip={{
                                content: (
                                    <Box
                                        pad="small"
                                        round="small"
                                        background={dark ? "dark-1" : "light-3"}
                                    >
                                        {dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                                    </Box>
                                ),
                                plain: true,
                            }}
                        />
                    </AppBar>
                    <PageContent>
                        <CurrenciesForm />
                    </PageContent>
                </Page>
            </Grommet>
        );
    }
}

export default AppGrommet
