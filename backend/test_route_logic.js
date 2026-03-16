const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const Profile = require('./models/Profile');
        const User = require('./models/User');
        const Marks = require('./models/Semester');
        const fs = require('fs');

        const getYearFromRegdNo = (regdNo) => {
            const str = String(regdNo || '').trim();
            if (str.length < 3 || str[0] !== '3') return null;
            const digits = str.substring(1, 3);
            if (!/^\d{2}$/.test(digits)) return null;
            return '20' + digits;
        };

        // Load all profiles with regdNo
        const allProfiles = await Profile.find(
            { regdNo: { $exists: true, $ne: null }, isDeleted: { $ne: true } },
            { regdNo: 1, userId: 1 }
        ).lean();

        const year = '2022';
        const matched = allProfiles.filter(p => getYearFromRegdNo(p.regdNo) === year);

        const userIds = matched.map(p => p.userId);
        const users = await User.find(
            { _id: { $in: userIds }, role: 'user', isDeleted: { $ne: true } },
            { _id: 1, email: 1 }
        ).lean();

        const userIdToEmail = {};
        users.forEach(u => { userIdToEmail[String(u._id)] = u.email; });

        const regdNoByEmail = {};
        matched.forEach(p => {
            const email = userIdToEmail[String(p.userId)];
            if (email) regdNoByEmail[email] = p.regdNo;
        });

        const emails = Object.keys(regdNoByEmail);
        const marksData = await Marks.find({ email: { $in: emails } }).lean();

        const result = {
            totalProfiles: allProfiles.length,
            matchedForYear2022: matched.length,
            sampleMatchedRegdNos: matched.slice(0, 5).map(p => p.regdNo),
            emailsResolved: emails.length,
            marksFound: marksData.length,
            sampleMarks: marksData.slice(0, 2).map(m => ({ email: m.email, regdNo: regdNoByEmail[m.email], sems: m.semesters?.length }))
        };

        fs.writeFileSync('debug_profile_chain.json', JSON.stringify(result, null, 2));
        console.log('Written to debug_profile_chain.json');
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
