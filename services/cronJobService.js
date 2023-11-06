import Course from '../models/Course.js';
import ExamPhase from '../models/ExamPhase.js'
import Semester from '../models/Semester.js'
import cron from "node-cron";
import { modiDays } from '../utility/dayUtility.js';


export async function examPhaseCron() {
    let examPhaseList = await ExamPhase.findAll({
        where: {
            status: true,
            alive: 1
        }
    })
    for (const item of examPhaseList) {
        console.log(new Date(item.startDay));
        let day = modiDays(new Date(item.startDay), 3, 0)
        console.log(day);
        let startDay = new Date(day).getDate()
        let startMonth = new Date(day).getMonth() + 1
        console.log(startDay, startMonth);
        let jobPhase = new cron.schedule(
            `0 0 ${startDay} ${startMonth} *`,
            async () => {
                let result = await ExamPhase.update({ status: 0 }, {
                    where: {
                        id: item.id,
                        alive: 1
                    }
                })
                if(result[0] == 0) throw new Error('Update ExamPhase fail !')
                let result2 = await Course.update({ status: 0 }, {
                    where: {
                        ePId: item.semId,
                    }
                })
                if(result2[0] == 0) throw new Error('Update ExamPhase fail !')
            },
            {
                scheduled: true,
                timeZone: 'Asia/Ho_Chi_Minh' // Lưu ý set lại time zone cho đúng     
            }
        );
        await jobPhase.start();
    }
}


export async function semesterCron() {
    let semesterList = await Semester.findAll({
        where: {
            status: 1
        }
    })
    for (const item of semesterList) {
        let day = modiDays(new Date(item.end), 1, 1)
        let endDay = new Date(day).getDate()
        let endMonth = new Date(day).getMonth() + 1
        let jobSemester = new cron.schedule(
            `0 0 ${endDay} ${endMonth} *`,
            async () => {
                let result = await Semester.update({ status: 0 }, {
                    where: {
                        id: item.id
                    }
                })
                if(result[0] == 0) throw new Error('Update ExamPhase fail !')
            },
            {
                scheduled: true,
                timeZone: 'Asia/Ho_Chi_Minh' // Lưu ý set lại time zone cho đúng     
            }
        );
        await jobSemester.start();
    }
}


