import { Box, Button, Stack } from '@chakra-ui/react';
import { Document, Font, Page, PDFDownloadLink, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer';
import { ScheduleAdmin } from 'features/types';
import { history } from 'helpers';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';

export const UserSchedulesPDF: React.FC = (): JSX.Element => {
    const location = history.location;

    const data = (location?.state as { data: ScheduleAdmin[] }).data;

    if (!data.length) return (
        <div>Es wurden keine Daten ausgewählt</div>
    )

    if (!checkForSameMonth(data)) return (
        <div>Die Daten liegen nicht im selben Monat</div>
    )

    const fileName = data[0].location.title.toLocaleLowerCase() + '_' + moment(data[0].timeFrom).format('YYYY_MM') + '.pdf';
    console.log(fileName)

    return (
        <Stack direction='row' w='100%' spacing={8}>
            <Box w='100%' maxW={800} h='90vh' bg='tomato'>
                <PDFViewer width='100%' height='100%' showToolbar={false}>
                    <MyDocument data={data} />
                </PDFViewer>
            </Box >
            <Box h={100}>
                <Stack direction='column' spacing={4}>
                    <PDFDownloadLink document={<MyDocument data={data} />} fileName={fileName}>
                        {({ blob, url, loading, error }) => (loading ? 'Loading document...' : <Button colorScheme='purple' minW={200}>PDF erstellen</Button>)}
                    </PDFDownloadLink>
                    <Link to='..'>
                        <Button colorScheme='red' minW={200}>Zurück</Button>
                    </Link>
                </Stack>
            </Box>
        </Stack>
    )
}

Font.register({
    family: 'Oswald',
    src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
    },
    body: {
        paddingTop: 35,
        paddingBottom: 65,
        paddingHorizontal: 35,
        fontSize: 11,
    },
    section: {
        margin: 8,
        // border: '1px solid tomato'
    },
    heading: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 8
    },
    table: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
    },
    row50: {
        width: '50%',
    },
});

const MyDocument: React.FC<{ data: ScheduleAdmin[] }> = (props): JSX.Element => {
    const { data } = props;

    const monthYear = new Date(data[0].timeFrom).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

    return (
        <Document>
            <Page size="A4" style={[styles.page, styles.body]}>
                <View style={styles.section}>
                    <Text style={styles.heading}>Vorlage zur Dokumentation der täglichen Arbeitszeit</Text>
                </View>
                <View style={styles.section}>
                    <Text>
                        <Text>Arbeitgeber: </Text>
                        <Text style={[{ fontWeight: 'bold', color: 'blue' }]}>Evangelisch reformierte Kirchengemeinde Hoogstede</Text>
                    </Text>
                </View>
                <View style={styles.section}>
                    <Text>
                        <Text>Name des Mitarbeiters: </Text>
                        <Text style={[{ fontWeight: 'bold', color: 'blue' }]}>Heinrich Bleumer</Text>
                    </Text>
                </View>
                <View style={styles.section}>
                    <View style={styles.table}>
                        <View style={styles.row}>
                            <Text style={styles.row50}>
                                <Text>Personal-Nr.: </Text>
                                <Text style={[{ fontWeight: 'bold', color: 'blue' }]}>02024</Text>
                            </Text>
                            <Text style={[styles.row50, { textAlign: 'right' }]}>
                                <Text>Zeitraum: </Text>
                                <Text style={[{ fontWeight: 'bold', color: 'blue' }]}>{monthYear}</Text>
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.section}>
                    <ItemsTable data={data} />
                </View>
            </Page>
        </Document>
    )
}

// Create table styles
const tableStyles = StyleSheet.create({
    th: {
        backgroundColor: 'black',
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        paddingTop: 8,
        paddingBottom: 8
    },
    td: {
        paddingTop: 4,
        paddingBottom: 4,
        borderBottom: '1px solid black',
        textAlign: 'center'
    },
    tf: {
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 20,
        borderTop: '2px solid black'
        // color: 'white'
    },
    // So Declarative and unDRY 👌
    row17: {
        width: '17%',
    },
    row32: {
        width: '32%',
    },
    row100: {
        width: '100%'
    }
});

const ItemsTable = ({ data }: { data: ScheduleAdmin[] }): JSX.Element => {
    const dataSorted = data.sort((a, b) => a.timeFrom.toString().localeCompare(b.timeFrom.toString()))

    let duration = moment.duration('0')
    data.forEach(d => {
        let tStart = moment(d.timeFrom);
        let tEnd = moment(d.timeTo);
        let diff = tEnd.diff(tStart);
        duration.add(diff)
    });
    let durationString = moment.utc(duration.as('milliseconds')).format('H:mm')

    return (
        <View style={styles.table}>
            <View style={[styles.row, tableStyles.th]}>
                <Text style={tableStyles.row17}>Datum</Text>
                <Text style={tableStyles.row17}>Von</Text>
                <Text style={tableStyles.row17}>Bis</Text>
                <Text style={tableStyles.row17}>Dauer</Text>
                <Text style={tableStyles.row32}>Tätigkeit</Text>
            </View>
            {dataSorted.map((value) => {
                const tFrom = new Date(value.timeFrom);
                const tTo = new Date(value.timeTo);
                const x1 = moment(value.timeFrom);
                const x2 = moment(value.timeTo);
                let diff = x2.diff(x1);
                let duration = moment.utc(diff)
                return (
                    <View key={value.id} style={[styles.row, tableStyles.td]}>
                        <Text style={tableStyles.row17}>  {tFrom.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}</Text>
                        <Text style={tableStyles.row17}>{tFrom.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</Text>
                        <Text style={tableStyles.row17}>{tTo.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</Text>
                        <Text style={tableStyles.row17}>{duration.format('H:mm')} Std.</Text>
                        <Text style={tableStyles.row32}>{value.task.title}</Text>
                    </View>
                )
            })}
            <View style={[styles.row, tableStyles.tf]}>
                <Text style={[tableStyles.row100, { fontSize: 16 }]}>Summe: {durationString} Std.</Text>
            </View>
        </View>
    )
}

function checkForSameMonth(data: ScheduleAdmin[]): boolean {
    let isAllBetween = true;
    var date = new Date(data[0].timeFrom), y = date.getFullYear(), m = date.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0, 23, 59, 59);
    var startOfMonth = moment(firstDay);
    var endOfMonth = moment(lastDay);
    data.forEach(d => {
        const compareDate = moment(d.timeFrom);
        const isBetween = compareDate.isBetween(startOfMonth, endOfMonth);
        isAllBetween = isAllBetween && isBetween
    })
    return isAllBetween;
}