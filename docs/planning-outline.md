What we keep in mind that we should focus on for sure:
Core/MVP features — must build
Teacher login/dashboard
Student profile
Parent/caregiver questionnaire
AI-generated personalized learning activity
Student help button
AI-generated hints
Teacher alert when a student needs assistance
Stretch features — build if time allows
Scheduled sensory breaks
Advanced sensory accommodations
Music-based learning
Color customization
External LED notification device
More advanced activity monitoring
Project requirement:
For example:
User
What they need
Parent/Caregiver
Provide information about student's needs
Teacher
View student profiles and receive alerts
Student
Complete personalized learning activities
AI
Adapt learning material based on profile
Teacher
Receive notification when predefined assistance criteria are met

Then identify your main workflow:
Parent → Student Profile → AI → Personalized Lesson → Student → Teacher Alert
*Possible Teacher dashboard:
┌──────────────────────────────────────────┐
│          CLASSROOM DASHBOARD             │
├──────────────────────────────────────────┤
│                                          │
│  Student       Status        Attention   │
│                                          │
│  Student A     Learning        ✓         │
│  Student B     Needs Help      ⚠         │
│  Student C     Break           ⏸         │
│                                          │
├──────────────────────────────────────────┤
│ Administrative Tools                     │
│                                          │
└──────────────────────────────────────────┘
*Student Profile:
Student Profile

Learning Preferences:
☑ Music
☑ Visual
☐ Text-heavy

Communication:
☑ Nonverbal
☑ Visual prompts

Sensory Considerations:
☑ Avoid certain colors
☑ Scheduled breaks

Preferred Support:
☑ Step-by-step instructions
☑ AI hints
*Possible Student learning Screen:
        Today's Activity

       What is 2 + 3?

       [ 5 ]     [ 6 ]
       [ 4 ]     [ 7 ]

       💡 Need Help?

       [ TAKE A BREAK ]
Step 4 — Decide what AI is actually doing
"What exactly is the AI doing?"
The generative AI analyzes an individualized student profile and uses the information to generate or modify educational content according to predefined learning and sensory preferences.
AI Decision Flow
Something like:
Student Profile → AI analyzes preferences → AI generates/adapts learning material → Student interacts → AI provides hints if needed → System monitors predefined assistance conditions → Teacher receives alert when intervention may be needed

For example:
Student profile says:
Preferred learning method: music
 Communication: nonverbal
 Reading level: beginner
 Preferred interaction: visual
 Break interval: 20 minutes
The AI receives that information and generates an appropriate activity.
For example:
🎵 "Let's count together!
 One little star...
 Two little stars...
 How many stars are there?"
Step 5 — Pick your technology stack
Frontend
HTML/CSS/JavaScript
OR Streamlit if you want something much easier to build in Python
Backend
Python
AI
An LLM/API
Database
SQLite initially
Development
GitHub
VS Code
Google Colab for experimentation if needed
We could potentially build the first prototype almost entirely in Python with Streamlit + SQLite + an AI API.
*Mocked dashboard:

