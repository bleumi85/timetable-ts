import { Box, Button, Stack, useDisclosure, useToast } from '@chakra-ui/react';
import { Document, Page, PDFViewer, StyleSheet, Text, usePDF, View } from '@react-pdf/renderer';
import { SimpleConfirmation } from 'components';
import { Location, ScheduleAdmin } from 'features/types';
import { groupBy, history } from 'helpers';
import moment from 'moment';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage, useUpdateSchedulesPDFMutation } from '../timetableApi';

export const UserSchedulesPDF: React.FC = (): JSX.Element => {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [updateSchedules] = useUpdateSchedulesPDFMutation();

    const { rows, selectedRows, location } = history?.location?.state as {
        rows: ScheduleAdmin[],
        selectedRows: ScheduleAdmin[],
        location: Omit<Location, "accountId">
    }

    const data = useMemo(() => {
        if (selectedRows.length) {
            return selectedRows.filter((row) => row.location.id === location.id && !row.isTransferred)
        } else if (rows) {
            return rows.filter((row) => row.location.id === location.id && !row.isTransferred)
        } else {
            return []
        }
    }, [location.id, rows, selectedRows]);

    const [instance] = usePDF({ document: <MyDocument data={data} showAllDates={location.showCompleteMonth} /> });

    const submitDownload = async () => {
        try {
            if (instance.url) {
                let alink = document.createElement('a');
                alink.href = instance.url;
                alink.download = 'Testdatei.pdf';
                alink.click();
            }
            const ids = data.map(value => value.id);
            await updateSchedules(ids).unwrap();
            history.navigate && history.navigate('/schedules');
        } catch (err) {
            const errMsg = getErrorMessage(err);
            toast({
                title: 'PDF konnte nicht erstellt werden',
                description: errMsg,
                status: 'error',
                duration: 4000,
                isClosable: true
            })
        } finally {
            onClose()
        }
    }

    const toastId = 'dataLengthToast';
    if (!data.length) {
        if (!toast.isActive(toastId)) {
            toast({
                id: toastId,
                title: 'Fehler',
                description: 'Es wurden keine Daten ausgewählt',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
        history.navigate && history.navigate('/schedules');
    }

    // const fileName = data[0].location.title.toLocaleLowerCase() + '_' + moment(data[0].timeFrom).format('YYYY_MM') + '.pdf';

    return (
        <>
            <Stack direction='row' w='100%' spacing={8}>
                <Box w='100%' maxW={800} h='90vh' bg='tomato'>
                    <PDFViewer width='100%' height='100%' showToolbar={false}>
                        <MyDocument data={data} showAllDates={location.showCompleteMonth} />
                    </PDFViewer>
                </Box >
                <Box h={100}>
                    <Stack direction='column' spacing={4}>
                        <Button colorScheme='blue' onClick={onOpen}>
                            PDF erstellen
                        </Button>
                        <Link to='..'>
                            <Button colorScheme='red' minW={200}>Zurück</Button>
                        </Link>
                    </Stack>
                </Box>
            </Stack>
            <SimpleConfirmation
                header='PDF Download bestätigen'
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={submitDownload}
                message='1234'
            />
        </>
    )
}

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

const MyDocument: React.FC<{ data: ScheduleAdmin[], showAllDates: boolean }> = (props): JSX.Element => {
    const { data, showAllDates } = props;

    return (
        <Document>
            <Page size="A4" style={[styles.page, styles.body]}>
                <View style={styles.section} fixed>
                    <Text style={styles.heading}>Vorlage zur Dokumentation der täglichen Arbeitszeit</Text>
                </View>
                <View style={styles.section} fixed>
                    <Text>
                        <Text>Arbeitgeber: </Text>
                        <Text style={[{ fontWeight: 'bold', color: 'blue' }]}>Evangelisch reformierte Kirchengemeinde Hoogstede</Text>
                    </Text>
                </View>
                <View style={styles.section} fixed>
                    <Text>
                        <Text>Name des Mitarbeiters: </Text>
                        <Text style={[{ fontWeight: 'bold', color: 'blue' }]}>Heinrich Bleumer</Text>
                    </Text>
                </View>
                <ItemsTable data={data} showAllDates={showAllDates} />
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
    },
    // So Declarative and unDRY 👌
    row17: {
        width: '17%',
    },
    row32: {
        width: '32%',
    },
    row83: {
        width: '83%'
    },
    row100: {
        width: '100%'
    }
});

interface ScheduleAdminHelper extends ScheduleAdmin {
    monthYear: string;
    duration: moment.Moment;
}

type ItemsTableProps = {
    data: ScheduleAdmin[],
    showAllDates: boolean,
}

const ItemsTable: React.FC<ItemsTableProps> = (props): JSX.Element => {
    const { data, showAllDates } = props;
    const dataNew: ScheduleAdminHelper[] = data.map((d) => {
        var date = new Date(d.timeFrom), y = date.getFullYear(), m = date.getMonth();
        var monthYear = new Date(y, m, 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
        const tFrom = moment(d.timeFrom);
        const tTo = moment(d.timeTo);
        let diff = tTo.diff(tFrom);
        let duration = moment.utc(diff)
        return { ...d, monthYear, duration }
    });

    const dataMap = groupBy(dataNew, d => d.monthYear);

    return (
        <>
            {Array.from(dataMap, ([key, values], index) => {
                const valuesSorted = values.sort((a, b) => a.timeFrom.toString().localeCompare(b.timeFrom.toString()))
                const valuesWithRemarks = values.filter(value => value.remark)

                let duration = moment.duration('0')
                values.forEach(d => {
                    let tStart = moment(d.timeFrom);
                    let tEnd = moment(d.timeTo);
                    let diff = tEnd.diff(tStart);
                    duration.add(diff)
                });
                let durationString = moment.utc(duration.as('milliseconds')).format('H:mm')

                return (
                    <React.Fragment key={key}>
                        <View style={styles.section} break={index !== 0}>
                            <View style={styles.table}>
                                <View style={styles.row}>
                                    <Text style={styles.row50}>
                                        <Text>Personal-Nr.: </Text>
                                        <Text style={[{ fontWeight: 'bold', color: 'blue' }]}>02024</Text>
                                    </Text>
                                    <Text style={[styles.row50, { textAlign: 'right' }]}>
                                        <Text>Zeitraum: </Text>
                                        <Text style={[{ fontWeight: 'bold', color: 'blue' }]}>{key}</Text>
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.section}>
                            <View style={styles.table}>
                                <View style={[styles.row, tableStyles.th]}>
                                    <Text style={tableStyles.row17}>Datum</Text>
                                    <Text style={tableStyles.row17}>Von</Text>
                                    <Text style={tableStyles.row17}>Bis</Text>
                                    <Text style={tableStyles.row17}>Dauer</Text>
                                    <Text style={tableStyles.row32}>Tätigkeit</Text>
                                </View>
                                <ItemsTableRows values={valuesSorted} showAllDates={showAllDates} />
                                <View style={[styles.row, tableStyles.tf]}>
                                    <Text style={[tableStyles.row100, { fontSize: 16 }]}>Summe: {durationString} Std.</Text>
                                </View>
                            </View>
                        </View>
                        {valuesWithRemarks.length && <View style={[styles.section, { border: '1px solid #AAA', padding: 8 }]}>
                            <Text style={[{ fontSize: 14 }]}>Sonstiges:</Text>
                            {valuesWithRemarks.map((value) => (
                                <Text style={[{ marginTop: 4 }]} key={value.id}>- {value.remark} ({new Date(value.timeFrom).toLocaleDateString('de-DE')})</Text>
                            ))}
                        </View>}
                    </React.Fragment>
                )
            })}
        </>
    )
}

const ItemsTableRows = (props: { values: ScheduleAdminHelper[], showAllDates: boolean }): JSX.Element => {
    const { values, showAllDates } = props;

    if (!showAllDates) {
        return (
            <>
                {values.map((value) => {
                    const tFrom = new Date(value.timeFrom);
                    const tTo = new Date(value.timeTo);
                    return (
                        <View key={value.id} style={[styles.row, tableStyles.td]}>
                            <Text style={tableStyles.row17}>{tFrom.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}</Text>
                            <Text style={tableStyles.row17}>{tFrom.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</Text>
                            <Text style={tableStyles.row17}>{tTo.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</Text>
                            <Text style={tableStyles.row17}>{value.duration.format('H:mm')} Std.</Text>
                            <Text style={tableStyles.row32}>{value.task.title}</Text>
                        </View>
                    )
                })}
            </>
        )
    }

    const relevantDate = new Date(values[0].timeFrom);

    const dates = getAllDaysInMonth(relevantDate.getFullYear(), relevantDate.getMonth());

    return (
        <>
            {dates.map((date, index) => {
                let x = values.find((value) => new Date(value.timeFrom).setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0));
                return (
                    <View key={index} style={[styles.row, tableStyles.td, { padding: 0 }]}>
                        <Text style={[tableStyles.row17, { color: date.getDay() === 0 ? 'red' : '' }]}>{date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}</Text>
                        <Text style={tableStyles.row17}>{x ? new Date(x.timeFrom).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr' : ''}</Text>
                        <Text style={tableStyles.row17}>{x ? new Date(x.timeTo).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr' : ''}</Text>
                        <Text style={tableStyles.row17}>{x ? x.duration.format('H:mm') + ' Std.' : ''}</Text>
                        <Text style={tableStyles.row32}>{x ? x.task.title : ''}</Text>
                    </View>
                )
            })}
        </>
    );
}

function getAllDaysInMonth(year: number, month: number): Date[] {
    const date = new Date(year, month, 1);

    const dates = [];

    while (date.getMonth() === month) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    return dates;
}
