import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({});

async function main() {
    console.log('Seeding local database...');

    // 1. Create default admin user
    const hashedPassword = await bcrypt.hash('adminpassword123', 10);
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: { password: hashedPassword },
        create: {
            username: 'admin',
            password: hashedPassword,
        },
    });

    // 2. Categories
    const categoriesData = [
    {
        "name": "Academics & STEM",
        "color": "#3b82f6",
        "createdAt": "2026-02-25T07:04:03.329Z",
        "updatedAt": "2026-02-25T07:04:03.329Z"
    },
    {
        "name": "Arts & Media",
        "color": "#ec4899",
        "createdAt": "2026-02-25T07:04:03.699Z",
        "updatedAt": "2026-02-25T07:04:03.699Z"
    },
    {
        "name": "Athletics",
        "color": "#f97316",
        "createdAt": "2026-02-25T07:04:04.071Z",
        "updatedAt": "2026-02-25T07:04:04.071Z"
    },
    {
        "name": "Volunteering",
        "color": "#10b981",
        "createdAt": "2026-02-25T07:04:04.431Z",
        "updatedAt": "2026-02-25T07:04:04.431Z"
    },
    {
        "name": "Hobbies & Interests",
        "color": "#8b5cf6",
        "createdAt": "2026-02-25T07:04:04.800Z",
        "updatedAt": "2026-02-25T07:04:04.800Z"
    },
    {
        "name": "School & Leadership",
        "color": "#eab308",
        "createdAt": "2026-02-25T07:04:05.166Z",
        "updatedAt": "2026-02-25T07:04:05.166Z"
    },
    {
        "name": "Culture & Community",
        "color": "#14b8a6",
        "createdAt": "2026-02-25T07:04:05.533Z",
        "updatedAt": "2026-02-25T07:04:05.533Z"
    },
    {
        "name": "Business & Entrepreneurship",
        "color": "#4f46e5",
        "createdAt": "2026-02-25T07:04:05.897Z",
        "updatedAt": "2026-02-25T07:04:05.897Z"
    }
];
    for (const cat of categoriesData) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: { color: cat.color },
            create: { name: cat.name, color: cat.color },
        });
    }

    // 3. Clubs
    const clubsData = [
    {
        "id": "4fdb6e80-c3a6-4ca4-85d6-439602425030",
        "name": "Bollywood Club (formerly Bhangra)",
        "category": "Arts & Media",
        "description": "Bollywood Club is a fun way for people to connect with new cultures and discover a passion for dance! Along with performances at our school, we also perform for elementary schools and share the love of dance and diverse cultures with everyone!\n\n—\nSponsor Teacher: Emily Bosak/Ashley Pattenaude\nPresident/Leader: Kashvi Malik & Reya Dhaliwal\nMeeting Time: Tuesdays @ lunch\nRoom: Dance Studio",
        "instagram": "https://www.instagram.com/bcss_bollywoodclub/",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:52.245Z",
        "updatedAt": "2026-02-25T17:16:49.219Z"
    },
    {
        "id": "f4cae9ef-ff3a-4c04-9833-25528d2db6ed",
        "name": "Good Guys",
        "category": "Volunteering",
        "description": "Good Guys is a youth-led non-profit organization that educates and engages Canadian youth about the stigma that encompasses the less-fortunate. Our goal is to debunk that stigma and build a more open-minded generation of youth.\n\n—\nSponsor Teacher: Mr. Huang\nPresident/Leader: Bhima Kalia and Kailey Chen\nMeeting Time: Bi-weekly Tuesdays during lunch\nRoom: B212",
        "instagram": "https://www.instagram.com/goodguys.central",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:58.186Z",
        "updatedAt": "2026-02-25T17:30:32.491Z"
    },
    {
        "id": "620abc6a-a593-466e-bc80-efb080b2b10f",
        "name": "Art Club",
        "category": "Arts & Media",
        "description": "Art club is a club where students create art, learn from each other, and make friends while having fun. We do drawing, painting, clay sculpting, and more.\n\n—\nSponsor Teacher: Mr Steko\nPresident/Leader: June Chen\nMeeting Time: Wednesday lunch\nRoom: B120",
        "instagram": "https://www.instagram.com/bcss_artclub",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:50.764Z",
        "updatedAt": "2026-02-25T17:13:48.547Z"
    },
    {
        "id": "d0629eee-ddb2-4ba9-b97a-f2f5c5edd528",
        "name": "BCSS Stream Keepers",
        "category": "Volunteering",
        "description": "The Stream Keepers is a club that dedicates itself to protecting and educating about the environment! We love doing beach cleanups, water testing, and plant pulling. We work with city hall on after school meetings and are very passionate with helping our environment!\n\n—\nSponsor Teacher: Mr. Joe\nPresident/Leader: Aiden Kong\nMeeting Time: Mondays after school\nRoom: Science Lab",
        "instagram": "https://www.instagram.com/bcss_stream_keepers",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:51.501Z",
        "updatedAt": "2026-02-25T17:15:33.972Z"
    },
    {
        "id": "2b0973ec-adf0-419e-9060-90a36de5835f",
        "name": "Badminton Club",
        "category": "Athletics",
        "description": "In badminton club, we welcome everyone, with or without experience, to join us with the fun of sports and physical activities! Badminton club held  competitions and friendly tournaments in and out of school. We welcome anyone who likes to get some workout done and also meet new friends!\n\n—\nSponsor Teacher: Mr. Mah\nPresident/Leader: Megan Gimenes and Jenhao Shao\nMeeting Time: Tuesdays and Thursdays at 6:50am\nRoom: Large Gym",
        "instagram": null,
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:51.121Z",
        "updatedAt": "2026-02-25T22:28:57.183Z"
    },
    {
        "id": "8203ca76-a1e8-4816-9c7b-99ff62d2ea06",
        "name": "Black Excellence",
        "category": "Culture & Community",
        "description": "Sponsor Teacher: Mr. Best\nMeeting Time: Thursdays during lunch time\nRoom: A303",
        "instagram": "https://www.instagram.com/bexatcentral",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:51.878Z",
        "updatedAt": "2026-02-26T01:26:17.913Z"
    },
    {
        "id": "559773f9-c1e8-49c6-aacd-952388364d05",
        "name": "Computing Club",
        "category": "Academics & STEM",
        "description": "Anything and everything related to computer\n\n—\nSponsor Teacher: Fred Hawley\nPresident/Leader: Jamie Drummond, Yi Cheng Wu\nMeeting Time: Mondays @ Lunch & Wednesdays After School\nRoom: B125",
        "instagram": null,
        "discord": "https://discord.gg/tu5SRsKzMx",
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:55.258Z",
        "updatedAt": "2026-02-25T17:38:36.339Z"
    },
    {
        "id": "39624078-5acf-4fb7-af6e-e9767cf53528",
        "name": "Central Sports Council",
        "category": "Athletics",
        "description": "We are the scorekeepers, student coaches, referees, student managers of the sports teams at Burnaby Central\n\n—\nSponsor Teacher: Mr. Vagnarelli\nPresident/Leader: Olivia Feng, Esha Basi",
        "instagram": "https://www.instagram.com/bbycentral_athletics",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:53.744Z",
        "updatedAt": "2026-02-25T17:25:05.568Z"
    },
    {
        "id": "c75c0cb8-4b5b-4366-9d71-b373dec06f66",
        "name": "Central Debate Club",
        "category": "Academics & STEM",
        "description": "Improve public speaking skills through debate. Engaging in controversial topics.\n\n—\nSponsor Teacher: Mr. Branco\nPresident/Leader: Bhima Kalia and Clair Xing\nMeeting Time: Tuesdays at lunch\nRoom: C232",
        "instagram": "https://www.instagram.com/bcss_debate_club",
        "discord": "https://discord.gg/mTtTnKeTAF",
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:53.376Z",
        "updatedAt": "2026-02-25T17:37:52.288Z"
    },
    {
        "id": "d1c57e2a-a20d-4710-a292-3eb70cd25706",
        "name": "Community Club",
        "category": "Volunteering",
        "description": "We connect students to volunteering opportunities and host fundraisers towards members' passions\n\n—\nSponsor Teacher: Mr. Van De Wall\nPresident/Leader: Afsheen Hossain, Cynthia Low, Lamar Elghazouly\nMeeting Time: Mondays during lunch\nRoom: B217",
        "instagram": "https://www.instagram.com/communityclub.bcss",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:54.878Z",
        "updatedAt": "2026-02-25T17:26:08.942Z"
    },
    {
        "id": "2f350d4f-1bef-4559-b12d-8b84a8281b2c",
        "name": "Connect Media",
        "category": "Business & Entrepreneurship",
        "description": "We are a student-led non-profit marketing agency with a mission to help small businesses. We help small businesses by providing them with a variety of marketing services, completely free of charge. Connect Media is a club where students can apply the skills they learn in school to the real business world. Whether it be search engine optimization, website development, social media management, or photography.\n\n—\nSponsor Teacher: Mr. Kamiya\nPresident/Leader: Sandra Huang, Megan Winstanley\nMeeting Time: Wednesdays at Lunch\nRoom: B206",
        "instagram": "https://www.instagram.com/bcss.connectmedia",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:55.622Z",
        "updatedAt": "2026-02-25T17:27:30.567Z"
    },
    {
        "id": "be981118-97ed-463b-9b15-5af9fed4c840",
        "name": "Craft Club",
        "category": "Hobbies & Interests",
        "description": "In Crafts club students learn how to do many hands-on crafts from making jewelry, accessories to charms while improving on already existing skills with their friends! Students will also learn about many different business skills from the vice president and will be given opportunities to make profits from their crafts that will either go to charity or more supplies for the club!\n\n—\nSponsor Teacher: Mr Kraemer\nPresident/Leader: Nina Cvjetkovic\nMeeting Time: Monday and Wednesday at 12:20\nRoom: B213",
        "instagram": "https://www.instagram.com/bcss_crafts_club",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:55.997Z",
        "updatedAt": "2026-02-25T17:28:24.734Z"
    },
    {
        "id": "215ee4f3-2fa2-4069-a235-8db9395feb00",
        "name": "EMGirls",
        "category": "Business & Entrepreneurship",
        "description": "EMGirls at Burnaby Central focuses on bridging the gender gaps for women in the business sector. By joining us you will gain great experience, connections with different people and have the opportunity to meet with university students and business owners through different workshops.\n\n—\nSponsor Teacher: Mr.Lan\nPresident/Leader: Elva Zhang and Nicole Rong\nMeeting Time: Tuesdays at lunch\nRoom: B209",
        "instagram": "https://www.instagram.com/emgirls.bcss",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:56.729Z",
        "updatedAt": "2026-02-25T17:29:00.487Z"
    },
    {
        "id": "fb2742b9-bf09-4af2-af99-159f0405220a",
        "name": "Entrepreneurship Club",
        "category": "Business & Entrepreneurship",
        "description": "Entrepreneurship Club is where students can transform their ideas into real businesses. With funding and step-by-step guidance, members learn how to plan, pitch, and launch their own startups, while learning from industry professionals. Most importantly, students will gain valuable experience and get to keep the profits they earn!\n\n—\nSponsor Teacher: Mr. Lan\nPresident/Leader: Bellerie Tang\nMeeting Time: Tuesday Lunch\nRoom: B209",
        "instagram": "https://www.instagram.com/bcss.entrepreneur",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:57.092Z",
        "updatedAt": "2026-02-25T17:29:16.913Z"
    },
    {
        "id": "4ff70a69-4b1a-499f-b3bd-18cabcf06a89",
        "name": "Environment Club",
        "category": "Volunteering",
        "description": "Enviro Club is a group of students dedicated to making a positive impact regarding sustainability and how we handle the climate crisis. Currently we run recycling and waste management programs, community clean ups and are actively working with others to make more sustainable choices. Through these initiatives we hope to bring awareness to climate change, make it easier for others to reduce their environmental impact and inspire the community to become part of the change.\n\n—\nSponsor Teacher: Mr. Joe\nPresident/Leader: Aiden Kong, Bhima Kalia\nMeeting Time: Mondays after school\nRoom: Science Lab",
        "instagram": "https://www.instagram.com/centralsenviroclub",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:57.456Z",
        "updatedAt": "2026-02-25T17:29:49.074Z"
    },
    {
        "id": "e9f72149-460e-4935-b63c-e85f17697e11",
        "name": "Chess Club",
        "category": "Hobbies & Interests",
        "description": "Burnaby Central's Chess Club welcomes all skill levels of chess players, both experienced and beginners, who meet every week to play and share our passion for the game of chess. We host school and district chess competitions, offer lessons and programs, and give everybody the opportunity to improve their chess skills in a fun and supportive environment\n\n—\nSponsor Teacher: Mr. Herndier\nPresident/Leader: Bhima Kalia and Allen Chen\nMeeting Time: Wednesdays at lunch\nRoom: B216",
        "instagram": "https://www.instagram.com/bcsschessclub",
        "discord": "https://discord.gg/96EUutqmNh",
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:54.482Z",
        "updatedAt": "2026-02-25T17:37:28.062Z"
    },
    {
        "id": "587e6713-087a-4bfc-a543-25db22b44a4b",
        "name": "Crochet Club",
        "category": "Hobbies & Interests",
        "description": "Crochet Club is a club where we teach beginners and experienced people how to crochet or knit! We love making projects together like blankets and we enjoy doing fundraisers at the end of the year!\n\n—\nSponsor Teacher: Donna Kraemer\nPresident/Leader: Umber Khakh\nMeeting Time: Fridays at lunch\nRoom: C228",
        "instagram": "bcss_crochet.club (instagram)",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:56.373Z",
        "updatedAt": "2026-02-25T22:29:15.919Z"
    },
    {
        "id": "059c19c4-2a7d-4098-99a8-8c210e43dfcb",
        "name": "Film Club",
        "category": "Arts & Media",
        "description": "Film club is a creative and relaxing space for movie lovers, where we all share a passion for film and art.\n\n—\nSponsor Teacher: Ms. Barichello\nPresident/Leader: Jack Liu, Leon Basset, Tim Su, Josiah Ho\nMeeting Time: Mondays at lunch",
        "instagram": null,
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:57.819Z",
        "updatedAt": "2026-02-25T07:04:14.050Z"
    },
    {
        "id": "5c9a13f9-2fb5-481b-9e5c-764b9c30401e",
        "name": "Business Club",
        "category": "Business & Entrepreneurship",
        "description": "Business club is composed of executive and club members who organize and host various club sales and events. These activities aim at equipping members with the tools necessary to succeed in the ever-changing world of business.\n\n—\nSponsor Teacher: Mr. Kamiya\nPresident/Leader: Alexis Robinson, Emily Kam\nMeeting Time: Monday, lunch\nRoom: B206",
        "instagram": "https://www.instagram.com/bcssbusinessclub/",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:53.010Z",
        "updatedAt": "2026-02-25T17:23:49.186Z"
    },
    {
        "id": "21252925-e24f-4995-b597-2c01e5c391c0",
        "name": "International Connection",
        "category": "Culture & Community",
        "description": "Central International Connection Club is dedicated to assisting international students in finding a sense of belonging within the school community. Recognizing the challenges and isolation that can come with living in a foreign country, our aim is to foster a supportive environment where students feel welcomed, understood, and valued.\n\n—\nSponsor Teacher: Ms. Lei\nPresident/Leader: Iris Cheng,  Lorena Huang\nMeeting Time: Friday lunchtime\nRoom: B219",
        "instagram": "https://www.instagram.com/Bcss_international_connection",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:59.686Z",
        "updatedAt": "2026-02-25T17:31:39.219Z"
    },
    {
        "id": "77019998-4ba4-4b79-b5c0-96092d3545d8",
        "name": "K-Pop Club",
        "category": "Arts & Media",
        "description": "is a safe space where people who share the same passion for dance and K-pop can spend time together. On Thursdays at lunch, we learn the latest choreographics and have fun together ensuring a welcoming environment. Some members also partake in performances to showcase our love for dancing and share our skills with the rest of the community. Orphic Dance Crew is full of enthusiastic dancers who hop to bring the best performaces to Central!\n\n—\nSponsor Teacher: Ms Bosak\nPresident/Leader: Yolanda Tse & Kate Ferry\nMeeting Time: Thursday lunch time\nRoom: B228",
        "instagram": "https://www.instagram.com/bcss_kpopclub",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:00.065Z",
        "updatedAt": "2026-02-25T17:31:59.238Z"
    },
    {
        "id": "45a36015-ca5a-4598-979e-174d3237dc1e",
        "name": "Math  Club",
        "category": "Academics & STEM",
        "description": "To develop an understanding and appreciation of mathematics, also there will be friendly competitions often. Come if you want to learn! B218 on Thursday afterschool.\n\n—\nSponsor Teacher: Mr. vandeWall\nPresident/Leader: Kevin Luo, Kushal Gangarapu, Jamie Drummond\nMeeting Time: Wednesdays during lunch\nRoom: B217",
        "instagram": "https://www.instagram.com/bcss_mathclub",
        "discord": "https://discord.gg/yYFYhrGMUZ",
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:00.801Z",
        "updatedAt": "2026-02-25T17:37:00.285Z"
    },
    {
        "id": "58a8c961-b208-4577-8d2d-a5d926a54021",
        "name": "Peace 4 Youth",
        "category": "Culture & Community",
        "description": "We read the bible and build meaningful relationships, as our interest is understanding God through His Word. While sharing personal experiences and supporting one another in this journey\n\n—\nSponsor Teacher: Ms.Gallivan\nPresident/Leader: Caris Lee, Jazziel Sisyanto, Marcus Wu, Jonathan Li\nMeeting Time: Wednesday at lunch\nRoom: B113",
        "instagram": "https://www.instagram.com/peace4youth_",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:01.168Z",
        "updatedAt": "2026-02-25T17:32:39.201Z"
    },
    {
        "id": "0a6aab6c-d7b8-416d-929b-9d78c6c3301a",
        "name": "Social Justice Club",
        "category": "Culture & Community",
        "description": "The social justice club aspires the next generations to think about inclusivity, equality, and change we aspire to create and lead a new generation of social activist. Its a space where students come together to address issues of inequality and promote positive change within the school and community. We engage in meaningful discussions, organize events, and raise awareness on topics like human rights, environmental justice, and diversity\n\n—\nSponsor Teacher: Ms. Colling\nPresident/Leader: Marisa Unadkat\nMeeting Time: Wednesday @lunch\nRoom: C234",
        "instagram": "https://www.instagram.com/Social.justice.central",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:02.259Z",
        "updatedAt": "2026-02-25T17:33:01.860Z"
    },
    {
        "id": "a7c1f806-ac88-43a7-a560-4eb78d68b87d",
        "name": "Rubik Cube Club",
        "category": "Hobbies & Interests",
        "description": "A chill place to solve Rubik’s cubes, improve your cube solving skills or even help you solve the Rubik’s cube for the first time.\n\n—\nSponsor Teacher: Ms. Barichello\nPresident/Leader: Rhys Kam\nMeeting Time: Tuesday @ Lunch\nRoom: C332",
        "instagram": null,
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:01.529Z",
        "updatedAt": "2026-02-25T07:04:17.339Z"
    },
    {
        "id": "ed169a41-9a6a-4785-9b77-1ab2f3c04f36",
        "name": "Rugby Club",
        "category": "Athletics",
        "description": "Rugby Club is to help everyone improve their skills and get players into rugby. We want everyone to have fun while also learning at the same time. We practice our game tactics, tackling, passing, and defensive, and offensive positioning.\n\n—\nSponsor Teacher: Mr. Vagnarelli\nPresident/Leader: Radion Tabo, Thanit Sangcharuck",
        "instagram": null,
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:01.893Z",
        "updatedAt": "2026-02-25T07:04:17.709Z"
    },
    {
        "id": "ffe1a918-6f51-4c6d-adf3-4074de52d79c",
        "name": "Literacture Club",
        "category": "Academics & STEM",
        "description": "In Literature Club, members share their passion for the art and craft of creative writing and stories. We motivate and teach members to discuss books they enjoy with others, participate in our writing contests, and to help each other improve their skills and to grow as a tight -knit community.\n\n—\nSponsor Teacher: Ms Payne\nPresident/Leader: June Chen, Terry Tra\nMeeting Time: Friday lunch\nRoom: C330",
        "instagram": "https://www.instagram.com/bcss.literatureclub",
        "discord": "https://discord.gg/mHc7gnMCzE",
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:00.437Z",
        "updatedAt": "2026-02-25T17:36:42.704Z"
    },
    {
        "id": "a905989d-14ae-4d76-b1d8-7275a06e02ce",
        "name": "SOGI",
        "category": "Culture & Community",
        "description": "SOGI stands for Sexual Orientation and Gender Identity. We spread awareness for events relating to the LGBTQ2+ community and create a safe environment in the school. We embrace diversity and think everyone deserves acceptance and a place to be themselves.\n\n—\nSponsor Teacher: Ms. Payne & Em Proctor\nPresident/Leader: N/A\nMeeting Time: Thursdays @ lunch\nRoom: C329\nNotes: Students to contact: Alexis Robinson, Morgan Law",
        "instagram": null,
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:02.628Z",
        "updatedAt": "2026-02-25T07:04:18.458Z"
    },
    {
        "id": "4f0c866c-0c04-438e-b6a0-37b60fc54f90",
        "name": "Student Government",
        "category": "School & Leadership",
        "description": "Student Government is comprised of elected officials and auxiliary members who put on various activities for the whole student body at Burnaby Central. They are also in charge of ensuring the operations of all other Burnaby Central clubs adhere to school guidelines.\n\n—\nSponsor Teacher: Mr. Hendry\nPresident/Leader: Bhima Kalia & Yordi Abera\nMeeting Time: Mondays & Thursdays @ Lunch\nRoom: B212",
        "instagram": "https://www.instagram.com/burnaby_wildcats",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:03.356Z",
        "updatedAt": "2026-02-25T17:33:35.256Z"
    },
    {
        "id": "d56022b3-d15a-4bfb-a2d8-215b575f9d1e",
        "name": "Ultimate Club",
        "category": "Athletics",
        "description": "Ultimate Frisbee Club brings together players of all skill levels to enjoy the fast-paced excitement of ultimate frisbee. With a mix of seasoned pros and those who are just starting out, we are a welcoming community that values sportsmanship and camaraderie. From weekly practices to friendly matches and tournaments, we're all about improving our skills while having a blast! Dog sports are the best!\n\n—\nSponsor Teacher: Ms. Jolliffe\nPresident/Leader: Megan Winstanley, Elva Zhang, Nathan Quach\nMeeting Time: Friday 3:55-5:30\nRoom: Turf Field",
        "instagram": "https://www.instagram.com/centralulti",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:03.730Z",
        "updatedAt": "2026-02-25T17:33:57.027Z"
    },
    {
        "id": "017c6576-5131-47b2-9a8a-ddff4e9047c4",
        "name": "Improv Club",
        "category": "Arts & Media",
        "description": "Improv Club is where students come together to explore self-creation, discovery, and expression. We make sure every member walks out with confidence and motivation. It's a great space for everyone to develop teamwork and social skills.\n\n—\nSponsor Teacher: Bonnie Stewart\nPresident/Leader: Baowen Yan\nMeeting Time: Mondays at lunch\nRoom: Theatre (B234)",
        "instagram": "https://www.instagram.com/bcss_improv",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:58.927Z",
        "updatedAt": "2026-02-25T17:31:15.588Z"
    },
    {
        "id": "8d9f809c-d3e5-439c-bff4-52f5a06a44b1",
        "name": "Interac Club",
        "category": "Volunteering",
        "description": "Interact is a Rotary-sponsored club for high school students wanting to connect with their community. Rotary is a worldwide organization, working on projects to make a positive impact locally and globally. This year, all of Burnaby Central's Interact Club's profits will be donated to BC Children's Hospital! Whether you like selling bubble tea or taiwenese chicken, or just want to make a difference in someone's life, Interact is the right place for you!\n\n—\nPresident/Leader: Morgan Law, Alyssa Yip, Zoey Lin",
        "instagram": "https://www.instagram.com/interactcentral",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:59.303Z",
        "updatedAt": "2026-02-26T01:27:54.633Z"
    },
    {
        "id": "e068544d-84c9-4216-82fd-7ee7eda206a3",
        "name": "STEM Club",
        "category": "Academics & STEM",
        "description": "STEM Club is a team of determined students with the mission of influencing and encouraging youth to find their passions. From genome editors to quantitative analysts, we strive to introduce to the vast variety of occupations in these fields!\n\n—\nSponsor Teacher: Mr. Joe\nPresident/Leader: Yi Cheng Wu, Sandra Huang\nMeeting Time: Thursdays at Lunch\nRoom: B317",
        "instagram": "https://www.instagram.com/bcss_stem",
        "discord": "https://discord.gg/zaFHF5E7f8",
        "imageUrl": "https://res.cloudinary.com/dpj83mejg/image/upload/v1772059026/zcacjytc3xhpq1jbd0bw.jpg",
        "createdAt": "2026-02-25T06:57:02.994Z",
        "updatedAt": "2026-04-09T22:07:06.429Z"
    },
    {
        "id": "1b63510b-fcd3-4f05-80c1-78a184c1c3f3",
        "name": "Grad Council",
        "category": "School & Leadership",
        "description": "Grad council is a club ran by the grads of Central. Throughout the year we host activities and fundraise money that will go into the grad class. The club is meant to bring the grad class together.\n\n—\nSponsor Teacher: Ms. Neves, Ms. Morabito\nMeeting Time: Fridays at lunch\nRoom: C228 (textiles)",
        "instagram": "https://www.instagram.com/centralgrad26_",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:58.561Z",
        "updatedAt": "2026-02-25T17:30:54.200Z"
    },
    {
        "id": "db2d0e27-f97a-49da-baec-65f1c916b777",
        "name": "Wheels of Change",
        "category": "Volunteering",
        "description": "To raise awareness on certain issues. Help out the community by volunteering. End of each month: fundaise for topic of month\n\n—\nSponsor Teacher: Daniel Cooper\nPresident/Leader: Vienna Dias, Liana Nikpaykaran, Vinuki Mahawatthe\nMeeting Time: Fridays @lunch\nRoom: C239",
        "instagram": "https://www.instagram.com/wheelsofchange_bcss",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:04.484Z",
        "updatedAt": "2026-02-25T17:34:19.709Z"
    },
    {
        "id": "e1e7f562-08ec-4104-a0c2-9a4377ca2f14",
        "name": "World In Student Hands Club (WISH)",
        "category": "Volunteering",
        "description": "\"World In Student Hands\" Club, or WISH, is a student-led initiative which has been dedicated to helping those in need for over 15 years. We raise funds for local and global charities through various fundraisers. Students volunteer in events during the year, where they develop amazing teamwork, acquire great leadership skills, and gain useful volunteering experience.\n\n—\nSponsor Teacher: Maria Morabito\nPresident/Leader: Vienna Dias, Liana Nikpaykaran, Vinuki Mahawaththe, Shreya Patel, Sneha Patel, Daiya Gahunia\nMeeting Time: Wednesdays at lunch\nRoom: C228",
        "instagram": "https://www.instagram.com/bcss_wishclub",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:04.852Z",
        "updatedAt": "2026-02-25T17:34:40.663Z"
    },
    {
        "id": "f912141b-e85d-468b-97c6-019af0a29706",
        "name": "Biology Club",
        "category": "Academics & STEM",
        "description": "Our goal is to create a safe space for students who enjoy biology and to explore beyond topics we learn at school\n\n—\nSponsor Teacher: Jared Mah\nPresident/Leader: Tim Su, Josiah Ho, Clair Xing\nMeeting Time: Mondays at lunch",
        "instagram": null,
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:05.232Z",
        "updatedAt": "2026-02-25T17:15:46.131Z"
    },
    {
        "id": "d9cd402c-94ff-4379-9b70-5ec796657137",
        "name": "Burnaby Central Robotics Club",
        "category": "Academics & STEM",
        "description": "Robotics club focuses on building strong problem-solving, leadership, and teamwork skills through student-led teams learning how to build robots from the ground up. We participate in VEX robotics competitions fostering practical application of theories learnt in school. Additionally, it provides an opportunity for students to work in high pressure situations and learn to thrive in them. Most of all it promotes STEM education to all students and valuable insight into the vast world of robotics.\n\n—\nSponsor Teacher: Mubariz Ali\nPresident/Leader: Jamie Drummond, Sandra Huang, Isaiah Lee\nMeeting Time: Tuesdays & Fridays After School\nRoom: B125",
        "instagram": "https://www.instagram.com/bcss.robotics",
        "discord": "https://discord.gg/G53b38trMF",
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:52.629Z",
        "updatedAt": "2026-02-25T17:36:13.654Z"
    },
    {
        "id": "c6c623e4-a658-49b5-b6df-94aedb692249",
        "name": "Bright Minds",
        "category": "Academics & STEM",
        "description": "Our goal is to create a safe, supportive space where students can learn, share, and grow together while raising awareness about mental health.\n\n—\nSponsor Teacher: Laida Falsetto\nPresident/Leader: Bhima Kalia, Nour Alhuda Abunafiseh\nMeetings: Friday @ lunch\nRoom: B307",
        "instagram": "https://www.instagram.com/bcss.brightminds/",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:06.036Z",
        "updatedAt": "2026-02-25T17:44:17.532Z"
    },
    {
        "id": "8528bce3-551e-4130-a3bf-6205667d1dd5",
        "name": "University Challenge Club",
        "category": "Academics & STEM",
        "description": "The University Challenge Club is based on the British University competition and game show ‘University Challenge’. We play this trivia game weekly with questions on history, geography, science and mathematics endeavouring to learn more about our world.\n\n—\nSponsor Teacher: Mr.Ali\nPresident/Leader: Judah Court Strickland, Mark Ivankovic\nMeeting Time: Thursdays at Lunch\nRoom: B308",
        "instagram": null,
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:04.110Z",
        "updatedAt": "2026-02-25T23:24:54.802Z"
    },
    {
        "id": "04525f62-7a2a-4f6b-bf8b-d62881e1fece",
        "name": "Central's Muslim Student Association",
        "category": "Culture & Community",
        "description": "This club is to represent all Muslims in the school and bring attention to significant Muslim holidays and traditions. Furthermore, it is to raise awareness and funds for Muslim charities and specifically Muslim countries. Lastly, it is an inclusive club, meaning anyone with an interest to help or interest in learning is welcome to join, it is not exclusively for Muslims only.\n\n—\nSponsor Teacher: Ms.Colling and Mr.cooper\nPresident/Leader: Abdullah Abunafiseh, Lamar Elghazouly, Mozhgan Mir Asadullah\nMeeting Time: Wednesdays at lunch\nRoom: C233",
        "instagram": "https://www.instagram.com/bcss_msa",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:56:54.110Z",
        "updatedAt": "2026-02-25T17:25:26.933Z"
    },
    {
        "id": "5b82ca8e-49e5-4786-8083-d9193e590632",
        "name": "D&D Club",
        "category": "Hobbies & Interests",
        "description": "D&D Club is a club where students play Dungeons and Dragons and other various table-top role-playing games. We create a fun and welcoming space for creativity in a fantasy setting. Come solve puzzles, roleplay combat, and make new friends!\n\n—\nSponsor Teacher: Mr. Ali\nPresident/Leader: Amaya Critoph, Kylie Ng, Alan Liu\nMeeting Time: 2482741, 1309757\nRoom: Fridays @ 3:00-5:00 PM\nNotes: B131",
        "instagram": "https://www.instagram.com/bcss_dnd",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-02-25T06:57:05.666Z",
        "updatedAt": "2026-02-25T17:28:42.788Z"
    },
    {
        "id": "904c0edd-da35-4208-a3ff-0977326c3a55",
        "name": "Wildcat Weekly",
        "category": "Arts & Media",
        "description": "Join Central's official newspaper, Wildcat Weekly! Gain experience writing✍️, communication🗣️, and work in a team environment!\n\n—\nSponsor Teacher: Kelly Payne\nPresident/Leader: Umber Khakh, Jayasiri Kollabathula\nMeeting Time: Tuesdays @ Lunch\nRoom: C330",
        "instagram": "https://www.instagram.com/bcss_wildcat.weekly",
        "discord": null,
        "imageUrl": null,
        "createdAt": "2026-03-03T19:29:10.420Z",
        "updatedAt": "2026-03-03T19:35:26.003Z"
    }
];
    for (const club of clubsData) {
        await prisma.club.upsert({
            where: { id: club.id },
            update: {
                name: club.name,
                category: club.category,
                description: club.description,
                instagram: club.instagram,
                discord: club.discord,
                imageUrl: club.imageUrl,
            },
            create: {
                id: club.id,
                name: club.name,
                category: club.category,
                description: club.description,
                instagram: club.instagram,
                discord: club.discord,
                imageUrl: club.imageUrl,
            },
        });
    }

    // 4. Events
    const eventsData = [
    {
        "id": "aa2e8b06-4caf-4d12-92f9-788f7bc3ff15",
        "title": "Semester 2 AP Courses: Exam Ordering Deadline",
        "date": "2026-03-12T19:00:00.000Z",
        "endDate": null,
        "description": "",
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:30:50.039Z",
        "updatedAt": "2026-07-29T22:58:48.945Z"
    },
    {
        "id": "84502e9e-257b-4e09-98f8-4fe10c6403a9",
        "title": "Grade 8 Semester 2 ADST Rotation 2 BEGINS",
        "date": "2026-03-10T07:00:00.000Z",
        "endDate": null,
        "description": "",
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:30:49.254Z",
        "updatedAt": "2026-07-29T22:58:53.416Z"
    },
    {
        "id": "7e85d123-8600-4323-a2b0-9c57ede05ecc",
        "title": "Grade 8 Semester 2 ADST Rotation 1 ENDS",
        "date": "2026-03-09T07:00:00.000Z",
        "endDate": null,
        "description": "",
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:30:48.478Z",
        "updatedAt": "2026-07-29T22:58:56.814Z"
    },
    {
        "id": "f20dd636-4225-4e64-925c-033f1b35214f",
        "title": "School Reopens After Spring Break",
        "date": "2026-03-30T07:00:00.000Z",
        "endDate": null,
        "description": "",
        "clubId": null,
        "recurring": null,
        "tags": [],
        "createdAt": "2026-07-29T22:30:59.714Z",
        "updatedAt": "2026-07-29T22:59:09.067Z"
    },
    {
        "id": "3586d880-b7ab-4265-937d-b9061eee03e7",
        "title": "Emergency Drill",
        "date": "2026-03-02T08:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:30:42.179Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "7a9aa143-117b-4f21-b211-fabdf68132b5",
        "title": "Valedictorian Announced",
        "date": "2026-03-02T20:15:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:30:42.975Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "af3cb5a1-39df-4333-8621-b7fbaecd0c77",
        "title": "Grade 9 Immunizations",
        "date": "2026-03-03T08:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:30:44.547Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "bf508032-c160-4423-b29f-cc6f9baba735",
        "title": "Math Contest",
        "date": "2026-03-04T08:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:30:45.325Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "1ce15f95-a212-4b60-8261-4b80516f2a57",
        "title": "Teacher Conference Sign Up Online CLOSES",
        "date": "2026-03-05T23:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:30:46.096Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "2a20fda7-4285-401d-b101-79226b4b4f2c",
        "title": "International Lunch Meeting",
        "date": "2026-03-06T20:15:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:30:47.671Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "b751fc14-0c4a-4f92-a5a2-c88fa20e5b27",
        "title": "Last Day Before Spring Break",
        "date": "2026-03-13T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:30:50.813Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "f4096cc1-0620-4f7e-92aa-ffc4e1ca28bc",
        "title": "International Transgender Day of Visibility",
        "date": "2026-03-31T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:31:00.492Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "36209fc4-9dd8-4709-a267-b452c09710ae",
        "title": "Math Contest",
        "date": "2026-03-31T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:01.281Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "84a76eff-343a-4c3a-84d5-bb26cbe105c8",
        "title": "Lunar Lockbox",
        "date": "2026-03-09T07:00:00.000Z",
        "endDate": "2026-03-30T06:59:00.000Z",
        "description": "Lunar Lockbox from March 9 - March 29, 2026. Join for a chance to win over $200 dollars in prizes such as gift cards, Lego kits and more.",
        "clubId": "45a36015-ca5a-4598-979e-174d3237dc1e",
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-03-16T17:04:49.895Z",
        "updatedAt": "2026-03-16T17:04:49.895Z"
    },
    {
        "id": "393a28a9-e681-467d-b1fc-b64d4ea51095",
        "title": "Math Contest",
        "date": "2026-04-01T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:02.062Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "c52ad9fd-9f5f-42d9-bd05-06a5dbe44705",
        "title": "Grad Group Photo",
        "date": "2026-04-02T17:45:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:02.851Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "dea654e7-2558-4c3b-b7ef-1e16aba086f4",
        "title": "Good Friday",
        "date": "2026-04-03T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:31:03.635Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "45ac046f-15dc-4215-b0d5-189e64e7d701",
        "title": "Easter Monday",
        "date": "2026-04-06T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:31:04.433Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "bdfea97d-a70f-4703-a1bb-a8690756a1b1",
        "title": "District Band Night",
        "date": "2026-04-07T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Arts & Media"
        ],
        "createdAt": "2026-07-29T22:31:05.240Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "38b2ecc1-f380-4792-82d0-da49ee8bb8d2",
        "title": "International Day of Pink",
        "date": "2026-04-08T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:31:06.070Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "ed812e31-0b5b-4046-a624-0661fc3c5f6d",
        "title": "First Day of Term 4",
        "date": "2026-04-14T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:10.878Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "a041e715-8834-464b-9f23-09ad27e56e89",
        "title": "Vaisakhi",
        "date": "2026-04-14T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:31:11.793Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "5d24e754-0e3a-42bd-9b4b-3aff8204d23d",
        "title": "PERIOD 10 CANCELED TODAY: STAFF MEETING @ 2:30",
        "date": "2026-04-15T21:30:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:13.413Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "4a5eacdc-28a8-4425-8073-8da80c573c00",
        "title": "School Leaving Ceremony: Grade 12 Grad Form #2 Due",
        "date": "2026-04-18T19:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:15.783Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "83d6bb63-42ea-4afa-9c04-8ba0c8d6777b",
        "title": "Earth Day",
        "date": "2026-04-22T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:31:18.151Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "e9a553bc-e666-4d41-bd08-a39aef4ba0d3",
        "title": "Math Contest",
        "date": "2026-04-22T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:18.937Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "61812814-eb71-42db-824e-a00a33bbf168",
        "title": "Pro-D Day",
        "date": "2026-04-27T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:22.047Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "15cb1f13-3af8-47a5-990c-d902c1e65c83",
        "title": "International Day of Mourning",
        "date": "2026-04-28T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:31:22.828Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "27ba30ca-cc15-4fc2-b3e6-8cddc5e9d42f",
        "title": "Math Contest",
        "date": "2026-04-29T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:23.620Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "e024e2ed-fd20-43ea-90e1-9ed7194ad69b",
        "title": "Semester 2 (Term 3) Report Cards Posted Online",
        "date": "2026-04-30T22:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:24.397Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "df4bda6c-597f-42dd-819c-6f298e37343c",
        "title": "ELL Testing for AIPs",
        "date": "2026-05-01T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:26.035Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "b78c849f-0c5e-4520-9e23-36c84e5877d0",
        "title": "Math Contest",
        "date": "2026-05-01T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:26.950Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "e3a11439-33b2-4355-a7db-3c554a968337",
        "title": "District Choir Ensemble Night",
        "date": "2026-05-04T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Arts & Media"
        ],
        "createdAt": "2026-07-29T22:31:29.376Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "5b6a01e6-537a-4a95-aec6-645945b3e572",
        "title": "Grade 8 Semester 2 ADST Rotation 2 Ends",
        "date": "2026-05-06T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:32.689Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "4d05a8ec-a28f-4994-9009-3e40568646fb",
        "title": "Grade 8 Semester 2 ADST Rotation 3 STARTS",
        "date": "2026-05-07T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:34.326Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "67f6a769-e2cd-4b54-a79e-e1e57911d6ad",
        "title": "Math Contest",
        "date": "2026-05-13T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:40.894Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "16cc7510-458e-4456-9bb6-f81070841057",
        "title": "AP EXAM: AP COMPUTER SCIENCE PRINCIPLES",
        "date": "2026-05-14T18:30:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:41.774Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "f31e3447-bd5a-408a-926d-f43f11d019c0",
        "title": "Pro-D Day",
        "date": "2026-05-15T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:42.570Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "a48b500b-7506-4cdb-ad03-5633172e41fe",
        "title": "AP EXAM: AP COMPUTER SCIENCE A",
        "date": "2026-05-15T18:30:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:43.387Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "9fb5e822-262e-453a-9e8c-f35889beb60d",
        "title": "International Day Against Homophobia, Transphobia and Biphobia",
        "date": "2026-05-17T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:31:44.158Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "663e4e36-d339-4b75-baae-6f3d42da1061",
        "title": "Spring Vacation",
        "date": "2026-03-16T07:00:00.000Z",
        "endDate": "2026-03-28T06:59:59.000Z",
        "description": "",
        "clubId": null,
        "recurring": null,
        "tags": [],
        "createdAt": "2026-07-29T22:43:13.977Z",
        "updatedAt": "2026-07-29T22:59:03.415Z"
    },
    {
        "id": "31d3d921-fe15-4df5-b8b6-5584a32e7b11",
        "title": "Coaches Luncheon",
        "date": "2026-06-23T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Athletics"
        ],
        "createdAt": "2026-07-29T22:32:12.306Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "2cb5bc69-1344-43ac-95fe-a3a97cdd1d11",
        "title": "Last Day of School",
        "date": "2026-06-25T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:32:14.624Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "f5b4f691-7ff3-41c8-bec7-349b8b56f79b",
        "title": "Semester 2 (Term 4) Final Report Cards Posted Online",
        "date": "2026-06-25T22:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:32:15.405Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "5ea324b5-dbdd-4ec7-a2f7-a9fc64000d97",
        "title": "Cultural Appreciation Week",
        "date": "2026-04-13T07:00:00.000Z",
        "endDate": "2026-04-18T06:59:59.000Z",
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:43:14.754Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "a51be22d-257f-4adf-b046-daa564ddbdaf",
        "title": "Numeracy 10/Literacy 10/Literacy 12 Assessment Week",
        "date": "2026-04-20T07:00:00.000Z",
        "endDate": "2026-04-25T06:59:59.000Z",
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:43:15.581Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "a479130c-ba9f-4561-b763-9b56d43d3678",
        "title": "Whistler Music Fest",
        "date": "2026-05-01T07:00:00.000Z",
        "endDate": "2026-05-03T06:59:59.000Z",
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Arts & Media"
        ],
        "createdAt": "2026-07-29T22:43:16.338Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "9a6c51da-0acc-4375-ba5f-d582b485c7c9",
        "title": "Mental Health Week",
        "date": "2026-05-04T07:00:00.000Z",
        "endDate": "2026-05-09T06:59:59.000Z",
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:43:17.136Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "c05a730d-cd4e-4baf-bc64-be5568ca7dcb",
        "title": "Dance Company Auditions",
        "date": "2026-05-19T07:00:00.000Z",
        "endDate": "2026-05-22T06:59:59.000Z",
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Arts & Media"
        ],
        "createdAt": "2026-07-29T22:43:17.926Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "093b2b83-25cb-4440-a4ad-1313cfea5b89",
        "title": "Burnaby Central Pride Week",
        "date": "2026-06-08T07:00:00.000Z",
        "endDate": "2026-06-13T06:59:59.000Z",
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:43:18.814Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "73b1c57d-1214-4c53-837a-b775b614d526",
        "title": "Alternate Schedule Week",
        "date": "2026-06-22T07:00:00.000Z",
        "endDate": "2026-06-26T06:59:59.000Z",
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:43:19.608Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "bd49ed14-21b0-4592-90de-20f85db25032",
        "title": "Math Contest",
        "date": "2026-04-09T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:06.891Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "79a563fb-0837-4174-8949-ba9af66b9d0c",
        "title": "Last Day of Term 3",
        "date": "2026-04-13T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:08.445Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "2c94e155-f066-42af-a440-f93df56bf943",
        "title": "Emergency Drill",
        "date": "2026-04-14T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:10.022Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "b05500fd-bd69-4f41-b7ca-d6ca751dd994",
        "title": "AP Art Portfolios Due",
        "date": "2026-05-07T19:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:35.114Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "cf51ff33-3b3a-4b93-b4d0-4c4c6c1fe774",
        "title": "AP EXAM: CHINESE LANGUAGE & CULTURE",
        "date": "2026-05-08T14:30:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:36.794Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "91cfe254-fe2e-4533-b298-77f776ba6027",
        "title": "AP EXAM: AP MACROECONOMICS EXAM",
        "date": "2026-05-08T18:30:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:37.575Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "6624eef4-cc05-48e0-9bcb-004054721fa8",
        "title": "AP EXAM: AP CALCULUS AB/BC EXAM",
        "date": "2026-05-11T14:30:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:38.354Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "6b8c7045-f5d4-4213-9e01-426f4ac6774b",
        "title": "Emergency Drill",
        "date": "2026-05-12T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:39.139Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "1d171503-f1d6-4e5c-a986-70e6b9d4020e",
        "title": "AP EXAM: AP PSYCHOLOGY",
        "date": "2026-05-12T18:30:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:40.057Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "750d0af1-4663-4257-a590-eea0be73b829",
        "title": "Victoria Day",
        "date": "2026-05-18T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:31:44.936Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "2720f9cb-454a-46f5-bd59-ad5c4f935241",
        "title": "Choose Your Ride",
        "date": "2026-05-19T19:15:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:46.570Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "c24a6140-a99d-4bc7-8acb-46534483113e",
        "title": "PERIOD 6 CANCELED TODAY: STAFF MEETING @ 8:00",
        "date": "2026-05-20T15:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:48.158Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "18caafb9-5a51-4575-946a-297146ffa74e",
        "title": "ELL Year End Testing",
        "date": "2026-05-21T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:31:49.792Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "cf2cb12e-c88b-4eaa-aa2b-ee84a7a44e47",
        "title": "Grad Gown Assembly & Distribution",
        "date": "2026-05-21T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:50.621Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "aa53e34a-6393-4de2-9855-6d5966ce4fba",
        "title": "School Leaving Ceremony",
        "date": "2026-05-23T20:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:51.404Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "b75e87bb-af91-4b59-940d-b87b2299a449",
        "title": "Eid Al-Adha",
        "date": "2026-05-26T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:31:52.179Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "df7d26dd-8b59-4d08-b7dd-a5b94fcca58e",
        "title": "Theatre Production & Art Gallery",
        "date": "2026-05-27T02:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Arts & Media"
        ],
        "createdAt": "2026-07-29T22:31:52.962Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "c0794704-a694-448f-9dc0-f06aa30308a4",
        "title": "Theatre Production & Art Gallery",
        "date": "2026-05-28T02:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Arts & Media"
        ],
        "createdAt": "2026-07-29T22:31:53.740Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "68014d30-31b3-4c26-ac38-ced94986c864",
        "title": "Wildcat for a Day",
        "date": "2026-05-28T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:54.549Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "6ec1cecb-7657-41f0-8315-de743c711858",
        "title": "Theatre Production & Art Gallery",
        "date": "2026-05-29T02:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Arts & Media"
        ],
        "createdAt": "2026-07-29T22:31:55.339Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "d7564c13-7e7e-49f7-bdf3-1d7604a178ee",
        "title": "Spring Band Concert",
        "date": "2026-06-10T02:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Arts & Media"
        ],
        "createdAt": "2026-07-29T22:31:59.447Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "6190fe72-f153-44e1-aa9a-d4bdab616baf",
        "title": "Dance Showcase",
        "date": "2026-06-11T02:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Arts & Media"
        ],
        "createdAt": "2026-07-29T22:32:01.053Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "8f40beb4-12ee-45b4-b3a6-cc170ce5ea82",
        "title": "International Lunch Meeting",
        "date": "2026-06-11T19:15:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Culture & Community"
        ],
        "createdAt": "2026-07-29T22:32:02.709Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "6416f8d4-08ea-40fd-b491-8eb4108d3f9d",
        "title": "Spring Choir Concert",
        "date": "2026-06-12T02:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Arts & Media"
        ],
        "createdAt": "2026-07-29T22:32:03.520Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "462eb7f0-6fe4-4871-b2e6-76f83d40423c",
        "title": "Locker Clean Out",
        "date": "2026-06-16T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:32:05.096Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "2c967c68-7e18-4496-96bc-1be5a7530e1c",
        "title": "Yearbook Distribution",
        "date": "2026-06-16T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:32:05.878Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "3fe30582-08d3-4709-9e21-76aa2e6e4888",
        "title": "Grad Breakfast",
        "date": "2026-06-16T16:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:32:06.687Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "48df00ce-35f1-4b46-aad2-be3b1a9b3c33",
        "title": "Athletics Award Ceremony",
        "date": "2026-06-16T23:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Athletics"
        ],
        "createdAt": "2026-07-29T22:32:07.473Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "a2b50a21-215b-4ad7-8b30-9092a4581b68",
        "title": "Grade 8 Semester 2 ADST Rotation 3 Ends",
        "date": "2026-06-19T07:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "Academics & STEM"
        ],
        "createdAt": "2026-07-29T22:32:08.257Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "b6f3bbb9-8502-446d-a54a-c39914c8b01f",
        "title": "Celebration of Excellence",
        "date": "2026-06-22T16:00:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:32:09.852Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "dcf73d80-e38f-4c77-b545-f34b810b723a",
        "title": "Grad Dinner & Dance",
        "date": "2026-06-23T00:30:00.000Z",
        "endDate": null,
        "description": null,
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:32:10.674Z",
        "updatedAt": "2026-07-29T22:46:34.240Z"
    },
    {
        "id": "f8c5b51b-b455-41a9-b64f-63386fa46869",
        "title": "Grassroots",
        "date": "2026-06-05T19:00:00.000Z",
        "endDate": null,
        "description": "",
        "clubId": null,
        "recurring": null,
        "tags": [
            "School & Leadership"
        ],
        "createdAt": "2026-07-29T22:31:57.045Z",
        "updatedAt": "2026-07-29T23:01:00.421Z"
    }
];
    for (const ev of eventsData) {
        await prisma.event.upsert({
            where: { id: ev.id },
            update: {
                title: ev.title,
                date: new Date(ev.date),
                endDate: ev.endDate ? new Date(ev.endDate) : null,
                description: ev.description,
                clubId: ev.clubId,
                recurring: ev.recurring,
                tags: ev.tags,
            },
            create: {
                id: ev.id,
                title: ev.title,
                date: new Date(ev.date),
                endDate: ev.endDate ? new Date(ev.endDate) : null,
                description: ev.description,
                clubId: ev.clubId,
                recurring: ev.recurring,
                tags: ev.tags,
            },
        });
    }

    // 5. Initialize metrics
    const metrics = await prisma.metrics.findFirst();
    if (!metrics) {
        await prisma.metrics.create({
            data: {
                activeUsers: 276,
                portalSignups: 0,
            },
        });
    }

    console.log('Database seeded successfully with all categories, clubs, events, and admin user!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
