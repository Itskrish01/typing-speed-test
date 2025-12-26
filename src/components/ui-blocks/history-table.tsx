import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { formatDistanceToNow } from "date-fns";

interface HistoryTableProps {
    data: any[];
}

export const HistoryTable = ({ data }: HistoryTableProps) => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px]">Date</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>WPM</TableHead>
                        <TableHead>Accuracy</TableHead>
                        <TableHead className="text-right">Errors</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No history found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium text-muted-foreground">
                                    {item.timestamp?.toDate ? formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true }) : "Just now"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="capitalize font-medium">{item.mode}</span>
                                        <span className="text-xs text-muted-foreground capitalize">{item.difficulty}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xl font-bold font-mono text-primary">{item.wpm}</span>
                                </TableCell>
                                <TableCell>
                                    <span className={`font-mono ${item.accuracy >= 95 ? "text-green-500" : item.accuracy >= 90 ? "text-yellow-500" : "text-red-500"}`}>
                                        {item.accuracy}%
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-mono text-muted-foreground">
                                    {item.errors || 0}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
