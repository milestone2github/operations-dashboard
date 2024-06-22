import React from 'react'
import { Pie, PieChart, ResponsiveContainer , XAxis , YAxis , CartesianGrid  , Tooltip , Legend} from 'recharts';

const Piechart = () => {
    const data01 = [
        {
            "name": "Group A",
            "value": 400
        },
        {
            "name": "Group B",
            "value": 300
        },
        {
            "name": "Group C",
            "value": 300
        },
        {
            "name": "Group D",
            "value": 200
        },
        {
            "name": "Group E",
            "value": 278
        },
        {
            "name": "Group F",
            "value": 189
        }
    ];
    const data02 = [
        {
            "name": "Group A",
            "value": 2400
        },
        {
            "name": "Group B",
            "value": 4567
        },
        {
            "name": "Group C",
            "value": 1398
        },
        {
            "name": "Group D",
            "value": 9800
        },
        {
            "name": "Group E",
            "value": 3908
        },
        {
            "name": "Group F",
            "value": 4800
        }
    ];

    return (
            <PieChart width={730} height={250}>
                {/* <YAxis/>
                <XAxis dataKey="name"/>
                <CartesianGrid strokeDasharray="5 5"/> */}
                <Tooltip/>
                {/* <Legend/> */}
                <Pie data={data01} type='monotone' dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" />
                <Pie data={data02} type='monotone' dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#82ca9d" label />
            </PieChart>
    )
}

export default Piechart