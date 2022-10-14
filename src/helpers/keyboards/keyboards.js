import keyboardsInfo from "./keyboards.info.js";
import { read, write } from "../../utils/FS.js";

const allCourses = read('courses.json')
let courses = []
for (let i = 0; i < allCourses.length; i += 2) {
    let arr = []

    if (allCourses[i]) {
        arr.push(allCourses[i].name, allCourses[i + 1]?.name)
    }
    courses.push(arr.filter(e => e))
}
courses.push([keyboardsInfo.main_menu])

export default {
    menu: [
        [keyboardsInfo.our_courses, keyboardsInfo.about],
        [keyboardsInfo.adress]
    ],
    courses
}