<!-- [![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=22132634)
# MSE 342 - Project template (based on the repository of MSE 245 - Project Deliverable 2)


## Development Tips:
- Use CodeSpaces for this project.
- In VSCode terminal on CodeSpaces start a new branch:
```git checkout -b your-branch-name```
- As you code, push daily changes to your GitHub repo's `d2` branch:
```
git add .
git commit -m "done feature xyz"
git push origin your-branch-name
```


### Setting up access to the database from Codespaces

Watch the video on how to set up connection to the database from Codespaces: https://vimeo.com/974744158/db6098a69b?share=copy

Follow the instructions and ensure that you are able to connect to the database from Codespaces.
   
Steps:

   1. Download the Private Key file `student_ed25519` from Learn (located under Contents > General lab resources) to your own computer. 
   
   2. Open GitHub in the browser. Go to Settings > Codespaces. Click on `New Secret` button. Type the word `STUDENT` in the `Name` field, and paste the content of the Private Key file in the `Value` field. In the `Repository Access` drop-down menu, select the name of your Lab 9 repository. Click `Add Secret` button. 
   
   3. Start CodeSpaces. In the Terminal on Codespaces, copy and paste the following:

   ```
   echo "${STUDENT}"
   ```
   
   If your setup has been correct so far, this will print the content of your private key to the terminal. Verify that it is displayed.

   4. Next, copy and paste the following:

   ```
   eval `ssh-agent`
   ```

   You should see the response like this: `Agent pid 28558`

   5. Next, copy and paste the following:

   ```
   ssh-add - <<< "${STUDENT}"
   ```

   You should see the following response: `Identity added: (stdin) (student@mse-msci-245)`


   6. Next, copy and paste the following. Make sure that you change `<your-user-name>` to your actual UW username (without the angle brackets). 
   
   ```
	ssh -o ServerAliveInterval=30 -L 3306:localhost:3306 <your-user-name>@mse-msci-245.uwaterloo.ca
   ssh -o ServerAliveInterval=30 -L 3306:localhost:3306 m74park@mse-msci-245.uwaterloo.ca
   ```

   You should see the prompt change to a line like this:

   ![image](/img/Lab9-img1.png)

   This means that you have successfully logged in to the remote server hosting the database. 
   
   Important: Do not close this terminal window!

   7. Start a new terminal in Codespaces by clicking on the following icon in the top-right corner of the terminal:
![image](/img/Lab9-img2.png)
   8. In the second terminal, type `yarn dev` to start the app on port 3000.

   9. In the root project directory, edit `config.js`, by adding your UW username on Lines 3 and on line 6. This will let you access the MySQL database named as `<your-username>` from NodeJS.
       


### Installing and initializing MySQL Workbench.

Watch the video on how to install and set up MySQL Workbench on your own computer: https://vimeo.com/974744257/e755329bf8?share=copy. 

Follow the instructions and ensure that you are able to connect to the database from MySQL Workbench.

#### Steps:

1. Install MySQL Workbench from https://www.mysql.com/products/workbench/

2. Open MySQL Workbench:

   Launch MySQL Workbench on your local machine.

3. Create a New Connection:

Click on the + icon next to MySQL Connections to create a new connection.

4. Configure Connection Settings:

Connection Name: `Remote MySQL via SSH`.
Connection Method: `Standard TCP/IP over SSH`.
Configure SSH Settings:

SSH Hostname: `mse-msci-245.uwaterloo.ca`
SSH Username: `your username`
SSH Key File: Path to your Private Key File, e.g., `/Users/yourusername/.ssh/student_ed25519` (Mac/Linux) or `C:\Users\yourusername\.ssh\student_ed25519` (Windows).
SSH Password: Leave this blank.

5. Configure MySQL Settings:

MySQL Hostname: `localhost`
MySQL Server Port: `3306`
Username: `your username`
Password: `MSE245-student`

6. Test Connection:

Click the Test Connection button to verify that the connection is working. You should see a success message if everything is configured correctly.

7. Save Connection:

Click OK to save the connection.

8. Final Steps

After setting up and saving the connection, you can double-click the connection in the MySQL Connections list to connect to your remote MySQL server via SSH.

### General tips:

Push changes to GitHub frequently:

```
git add .
git commit -m "feature completed"
git push origin your-branch-name
```

In your GitHub repo, create new pull request and merge `your-branch-name` branch with the `main` branch.

Created Sprint 1 Branch -->

# WATExchange: International Exchange Social Platform

## 🌎 Project Description
**WATExchange is a centralized web platform for University of Waterloo students interested in exchange to connect. It streamlines the application process by bridging the gap between prospective exchange students and alumni exchange students. It acts as a centralized platform for finding course equivalencies, sharing personal experiences, messaging with other prospective/alumni exchange students, and learning more information about the application process.


---

## ✨ Completed Features & User Stories

### 🎓 Course Equivalency & Academic Planning
* **Searchable Database:** Browse a searchable database of course equivalencies to see which foreign credits will be approved for your degree.
* **Credit Verification:** Alumni can upload successfully matched courses to the database to help future students verify their credits.
* **Advanced Filtering:** Filter past equivalencies by faculty, exchange term, school, country, and continent.
* **Sorting & Bookmarks:** Sort equivalencies (e.g. by recency, rating, university) and save courses to a personal shortlist where supported.

### 👤 Profile & Personalization
* **Dynamic Bios:** Create and edit personal bios.
* **Academic Tags:** Add tags for study abroad universities, locations, and exchange terms to connect with similar students.
* **Experience Sharing:** Alumni can post travel photos
* **Course Management:** Alumni can share, edit, and delete the specific courses they took directly on their profile.

### 🔍 User Search
* **Discover Users:** Dedicated Search area to find other students with filters for faculty, class year, and exchange term, plus a text search across name, username, program, exchange country, and exchange university.
* **Rich Cards:** Results show faculty, program, class year, exchange term, destination country, and host school (with profile tags when present).
* **Profile Preview:** Open a user from results to see more detail and start a conversation without leaving the flow.

### 📇 Directory & Support
* **Study Abroad Contacts:** Searchable contact cards for study abroad / international office staff (name, role, department, faculty, email).
* **Academic Advisors:** Filter advisors by faculty and search by name or program; advisor cards show programs and contact details.

### 📅 Exchange Calendar
* **Deadline Calendar:** Month view of application and milestone deadlines with status styling (upcoming, due soon, overdue, complete).
* **Filters:** Narrow milestones by program/type and destination (where applicable).
* **Application Checklist:** Tab for checklist-style items, progress, and item management aligned with the exchange timeline.
* **Export:** Download milestones as an `.ics` file for external calendars.

### 💬 Messaging & Conversations
* **Direct Messaging:** Full conversation history with other users; start chats from profiles or search.
* **New Conversation:** Create-message flow picks a user and opens a thread; empty drafts are cleaned up when leaving the thread without sending.
* **Message Times:** Conversation previews and timestamps use a consistent Eastern (North America) display timezone.

### 🔐 Authentication & Access Control
* **Secure Sign-In:** Users can create accounts and sign in using email authentication.
* **Protected Content:** Alumni profiles and uploaded content are only accessible to authenticated users.
* **Session Management:** Logged-in users remain authenticated across sessions until they sign out.
* **Email Verification:** Users who register with an email address ending in @uwaterloo.ca are automatically assigned a “UW Verified Student” tag to indicate they are University of Waterloo students. Firebase’s built-in email verification was initially considered and attempted however, emails sent to the uwaterloo.ca domain were automatically pre-checked by the university’s email security system. This caused the verification links to be opened before reaching the user, marking them as already used. As a result, domain-based verification was implemented as a less secure alternative.

---

## 🛠 Technical Stack
* **Frontend:** React
* **Backend:** Node.js
* **Database:** MySQL

---


## 👥 Development Team 
### (Sprint 1)

| Team Member | Responsibility Area |
| :--- | :--- |
| **Elly** | Messaging Systems (Direct Messaging, Chat History) |
| **Cindy** | User search Functionality |

### (Sprint 2)

| Team Member | Responsibility Area |
| :--- | :--- |
| **Zeina** | Profile Management (Reviews, Financial Planning) |
| **Matthew** | Course Equivalency (Sort) & Calendar/Resources (Contacts, Timeline)|
| **Elly** | Sign In (Authentication, Sign Up, Sign In) |

### (Sprint 3)

| Team Member | Responsibility Area |
| :--- | :--- |
| **Zeina** | Landing page, Profile Management (UI updates, delete account, profile tags) |
| **Matthew** | Calendar (Application checklist, Calendar view), Support (updated UI with tabs), Bookmark courses |
| **Elly** | Messaging (Start new message, notifications), Search (search by user, filters, message from search) |

---


AI declaration:

Zeina - Used for occasional debugging (syntax errors, package/networking errors, etc.)
* Used for fixing styling on some MUI components (ex. i learned from AI that a particular component comes with default styling)
* Used to determine that I need to use Multer for posting photos

Cindy - Used for debugging and design aid
* Used for making UI (e.g. flex box size) of some new components (e.g. loading screen) look more cohesive with existing components 
* Used to make mock data for jest tests 
* Used to help debug the syntax for the API url expression used in the stringMatching test 

Elly - Used for debugging and UI design
* Used to align UI elements such as the nav bar and logo
* Used to update README with Authentication & Access Control information