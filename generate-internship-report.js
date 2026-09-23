const path = require("path");
const fs = require("fs");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  PageBreak,
  LevelFormat,
} = require("docx");

const centerPara = (text, opts = {}) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, ...opts })],
  });

const heading = (text, level) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    heading: level,
    children: [new TextRun({ text, bold: true, font: "Times New Roman" })],
  });

const para = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 160, line: 360 },
    children: [
      new TextRun({ text, font: "Times New Roman", size: 24, ...opts }),
    ],
  });

const boldPara = (label, content) =>
  new Paragraph({
    spacing: { after: 160, line: 360 },
    children: [
      new TextRun({
        text: label,
        bold: true,
        font: "Times New Roman",
        size: 24,
      }),
      new TextRun({ text: content, font: "Times New Roman", size: 24 }),
    ],
  });

const bulletPara = (text) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 100, line: 360 },
    children: [new TextRun({ text, font: "Times New Roman", size: 24 })],
  });

const codeLine = (text) =>
  new Paragraph({
    spacing: { after: 40, line: 280 },
    children: [new TextRun({ text, font: "Courier New", size: 20 })],
  });

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };

const cell = (text, opts = {}) =>
  new TableCell({
    borders,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, font: "Times New Roman", size: 22, ...opts }),
        ],
      }),
    ],
  });

const headerCell = (text) => cell(text, { bold: true });

const createDocument = () =>
  new Document({
    styles: {
      default: {
        document: { run: { font: "Times New Roman", size: 24 } },
      },
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          centerPara("INDUSTRY INTERNSHIP", {
            bold: true,
            size: 36,
            font: "Times New Roman",
          }),
          centerPara("SUMMARY REPORT", {
            bold: true,
            size: 36,
            font: "Times New Roman",
          }),
          new Paragraph({ spacing: { after: 480 } }),
          centerPara("Google Cloud Cybersecurity", {
            size: 32,
            font: "Times New Roman",
          }),
          new Paragraph({ spacing: { after: 480 } }),
          centerPara("BACHELOR OF TECHNOLOGY", {
            bold: true,
            size: 32,
            font: "Times New Roman",
          }),
          centerPara("in", { size: 24, font: "Times New Roman" }),
          centerPara("COMPUTER SCIENCE AND ENGINEERING", {
            bold: true,
            size: 32,
            font: "Times New Roman",
          }),
          new Paragraph({ spacing: { after: 480 } }),
          centerPara("Submitted by", {
            italics: true,
            size: 24,
            font: "Times New Roman",
          }),
          centerPara("KHUSHI SINGH", {
            bold: true,
            size: 28,
            font: "Times New Roman",
          }),
          new Paragraph({ spacing: { after: 480 } }),
          centerPara(
            "SCHOOL OF COMPUTING SCIENCE AND ENGINEERING",
            { bold: true, size: 24, font: "Times New Roman" }
          ),
          centerPara(
            "GALGOTIAS UNIVERSITY, GREATER NOIDA, UTTAR PRADESH",
            { bold: true, size: 24, font: "Times New Roman" }
          ),
          centerPara("SUMMER 2025-2026", {
            bold: true,
            size: 24,
            font: "Times New Roman",
          }),

          pageBreak(),

          heading("BONAFIDE CERTIFICATE", HeadingLevel.HEADING_1),
          new Paragraph({ spacing: { after: 300 } }),
          para(
            "[Attach Internship Offer Letter / Bonafide Certificate / Internship Certificate here]",
            { italics: true, color: "888888" }
          ),

          pageBreak(),

          heading("TABLE OF CONTENTS", HeadingLevel.HEADING_1),
          new Paragraph({ spacing: { after: 200 } }),
          new Table({
            width: { size: 9026, type: WidthType.DXA },
            columnWidths: [1500, 5526, 2000],
            rows: [
              new TableRow({
                children: [
                  headerCell("CHAPTER"),
                  headerCell("TITLE"),
                  headerCell("PAGE NO"),
                ],
              }),
              new TableRow({ children: [cell(""), cell("Abstract"), cell("")] }),
              new TableRow({
                children: [
                  cell(""),
                  cell("List of Figures & List of Tables"),
                  cell(""),
                ],
              }),
              new TableRow({
                children: [cell(""), cell("List of Abbreviations"), cell("")],
              }),
              new TableRow({
                children: [cell("1"), cell("Introduction"), cell("")],
              }),
              new TableRow({
                children: [
                  cell("1.1"),
                  cell("Objective of the Internship"),
                  cell(""),
                ],
              }),
              new TableRow({
                children: [
                  cell("1.2"),
                  cell("Problem Statement and Research Objectives"),
                  cell(""),
                ],
              }),
              new TableRow({
                children: [
                  cell("1.3"),
                  cell("Description of Domain"),
                  cell(""),
                ],
              }),
              new TableRow({
                children: [
                  cell("1.4"),
                  cell("Brief Introduction about the Organization"),
                  cell(""),
                ],
              }),
              new TableRow({
                children: [cell("2"), cell("Technical Description"), cell("")],
              }),
              new TableRow({
                children: [cell("3"), cell("System Design"), cell("")],
              }),
              new TableRow({
                children: [cell("3.1"), cell("General Architecture"), cell("")],
              }),
              new TableRow({
                children: [cell("3.2"), cell("Design Phase"), cell("")],
              }),
              new TableRow({
                children: [cell("3.2.1"), cell("Data Flow Diagram"), cell("")],
              }),
              new TableRow({
                children: [cell("3.2.2"), cell("UML Diagrams"), cell("")],
              }),
              new TableRow({
                children: [cell("3.3"), cell("Methodology"), cell("")],
              }),
              new TableRow({
                children: [
                  cell("4"),
                  cell("System Implementation"),
                  cell(""),
                ],
              }),
              new TableRow({
                children: [
                  cell("5"),
                  cell("Results and Discussions"),
                  cell(""),
                ],
              }),
              new TableRow({
                children: [
                  cell("6"),
                  cell("Conclusion and Future Work"),
                  cell(""),
                ],
              }),
              new TableRow({
                children: [cell("7"), cell("Appendices"), cell("")],
              }),
              new TableRow({
                children: [cell("7.1"), cell("Source Code"), cell("")],
              }),
              new TableRow({
                children: [cell("7.2"), cell("Learning Experiences"), cell("")],
              }),
              new TableRow({
                children: [cell("7.3"), cell("SWOT Analysis"), cell("")],
              }),
            ],
          }),

          pageBreak(),

          heading("ABSTRACT", HeadingLevel.HEADING_1),
          new Paragraph({ spacing: { after: 200 } }),
          para(
            "This report presents a summary of the 8-Week AICTE - EduSkills Virtual Internship in Google Cloud Cybersecurity, undertaken by Khushi Singh, a B.Tech (Computer Science and Engineering) student at Galgotias University. The internship is conducted under the patronage of AICTE and follows a curriculum provided by Google Cloud."
          ),
          para(
            "The program is structured to build foundational and advanced knowledge in cloud security across eight progressive modules. Topics covered include cloud security fundamentals, identity and access management, risk management frameworks, threat and vulnerability management, incident detection and response, business continuity and disaster recovery (BCDR), and preparation for a Cloud Security Analyst role."
          ),
          para(
            "As the internship is currently in progress (April 2026 - June 2026), this report outlines the planned scope, learning objectives, and anticipated outcomes. The final report will be updated upon successful completion of all assessments and the capstone project. Upon completion, it is expected that the intern will have gained practical, industry-relevant skills in Google Cloud security tools and methodologies."
          ),

          pageBreak(),

          heading("LIST OF FIGURES", HeadingLevel.HEADING_1),
          new Paragraph({ spacing: { after: 200 } }),
          new Table({
            width: { size: 9026, type: WidthType.DXA },
            columnWidths: [1200, 1200, 4626, 2000],
            rows: [
              new TableRow({
                children: [
                  headerCell("S. NO"),
                  headerCell("FIG. NO"),
                  headerCell("TITLE"),
                  headerCell("PAGE NO"),
                ],
              }),
              new TableRow({
                children: [
                  cell("1"),
                  cell("3.1"),
                  cell("General Architecture of Google Cloud Security"),
                  cell(""),
                ],
              }),
              new TableRow({
                children: [cell("2"), cell("3.2"), cell("Data Flow Diagram"), cell("")],
              }),
              new TableRow({
                children: [cell("3"), cell("3.3"), cell("UML Diagram"), cell("")],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 400 } }),
          heading("LIST OF TABLES", HeadingLevel.HEADING_1),
          new Paragraph({ spacing: { after: 200 } }),
          new Table({
            width: { size: 9026, type: WidthType.DXA },
            columnWidths: [1200, 1200, 4626, 2000],
            rows: [
              new TableRow({
                children: [
                  headerCell("S. NO"),
                  headerCell("TABLE NO"),
                  headerCell("TITLE"),
                  headerCell("PAGE NO"),
                ],
              }),
              new TableRow({
                children: [
                  cell("1"),
                  cell("1.1"),
                  cell("Week-wise Internship Structure"),
                  cell(""),
                ],
              }),
              new TableRow({
                children: [cell("2"), cell("7.1"), cell("SWOT Analysis"), cell("")],
              }),
            ],
          }),

          pageBreak(),

          heading("LIST OF ABBREVIATIONS", HeadingLevel.HEADING_1),
          new Paragraph({ spacing: { after: 200 } }),
          new Table({
            width: { size: 9026, type: WidthType.DXA },
            columnWidths: [2000, 7026],
            rows: [
              new TableRow({
                children: [headerCell("Abbreviation"), headerCell("Full Form")],
              }),
              new TableRow({
                children: [
                  cell("AICTE"),
                  cell("All India Council for Technical Education"),
                ],
              }),
              new TableRow({
                children: [cell("GCP"), cell("Google Cloud Platform")],
              }),
              new TableRow({
                children: [cell("IAM"), cell("Identity and Access Management")],
              }),
              new TableRow({
                children: [cell("IaaS"), cell("Infrastructure as a Service")],
              }),
              new TableRow({
                children: [cell("PaaS"), cell("Platform as a Service")],
              }),
              new TableRow({
                children: [cell("SaaS"), cell("Software as a Service")],
              }),
              new TableRow({
                children: [cell("IaC"), cell("Infrastructure as Code")],
              }),
              new TableRow({
                children: [
                  cell("CSPM"),
                  cell("Cloud Security Posture Management"),
                ],
              }),
              new TableRow({
                children: [
                  cell("BCDR"),
                  cell("Business Continuity and Disaster Recovery"),
                ],
              }),
              new TableRow({
                children: [
                  cell("DevSecOps"),
                  cell("Development, Security, and Operations"),
                ],
              }),
              new TableRow({
                children: [
                  cell("AAA"),
                  cell("Authentication, Authorization, and Accounting"),
                ],
              }),
              new TableRow({
                children: [cell("VPC"), cell("Virtual Private Cloud")],
              }),
              new TableRow({
                children: [cell("SOC"), cell("Security Operations Center")],
              }),
              new TableRow({
                children: [
                  cell("SIEM"),
                  cell("Security Information and Event Management"),
                ],
              }),
            ],
          }),

          pageBreak(),

          heading("CHAPTER 1", HeadingLevel.HEADING_1),
          heading("INTRODUCTION", HeadingLevel.HEADING_2),
          new Paragraph({ spacing: { after: 200 } }),
          para(
            "The rapid adoption of cloud computing has transformed the digital landscape, making cloud security one of the most critical domains in the technology industry. Organizations worldwide are migrating their infrastructure and data to cloud platforms, creating an urgent need for skilled cloud security professionals. This internship provides an opportunity to gain hands-on exposure to Google Cloud's security ecosystem under the structured guidance of the AICTE - EduSkills Virtual Internship Program."
          ),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "1.1 Objective of the Internship",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),
          para(
            "The primary objective of this internship is to develop a thorough understanding of cloud security principles and practices as applied within the Google Cloud environment. The specific objectives include:"
          ),
          bulletPara(
            "Understanding the fundamentals of cloud security, deployment models, and Google Cloud architecture."
          ),
          bulletPara(
            "Learning Identity and Access Management (IAM), perimeter protection, and zero trust principles."
          ),
          bulletPara(
            "Gaining expertise in cloud security risk management, compliance frameworks, and vulnerability assessment."
          ),
          bulletPara(
            "Developing skills in detecting, responding to, and recovering from cloud cybersecurity attacks."
          ),
          bulletPara(
            "Building practical readiness for a Cloud Security Analyst role through a capstone project."
          ),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "1.2 Problem Statement and Research Objectives",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),
          para(
            "As cloud adoption accelerates, organizations face increasingly sophisticated cybersecurity threats including data breaches, misconfigurations, insider threats, and ransomware attacks targeting cloud environments. Traditional security models are insufficient for the shared-responsibility model of cloud computing. There is a critical need to understand how to identify, assess, and mitigate risks specific to cloud infrastructure, especially on platforms like Google Cloud."
          ),
          para(
            "This internship addresses these challenges by equipping the intern with knowledge of Google Cloud's native security tools - including Security Command Center, Cloud Armor, Chronicle SIEM, and policy-as-code frameworks - to build a robust security posture in real-world cloud environments."
          ),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "1.3 Description of Domain",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),
          para(
            "The domain of this internship is Cloud Cybersecurity, specifically within the Google Cloud Platform (GCP) ecosystem. Cloud cybersecurity encompasses the policies, technologies, and controls deployed to protect cloud-based systems, data, and infrastructure from threats."
          ),
          para("Key sub-domains covered in this internship include:"),
          bulletPara(
            "Cloud Security Fundamentals: Virtualization, containerization, storage security, and cloud deployment models (public, private, hybrid)."
          ),
          bulletPara(
            "Identity and Access Management (IAM): Role-based access control, credential management, and zero-trust architecture."
          ),
          bulletPara(
            "Risk Management: Compliance lifecycle, industry standards, and multicloud risk protection using Security Command Center."
          ),
          bulletPara(
            "Threat Detection and Response: Incident response, threat hunting, playbook automation, and BCDR on Google Cloud."
          ),
          bulletPara(
            "DevSecOps and IaC: Integrating security into the software supply chain using infrastructure-as-code and policy-as-code."
          ),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "1.4 Brief Introduction about the Organization",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),
          boldPara(
            "a. Brief History: ",
            "EduSkills Foundation is a non-profit organization established with the mission of bridging the gap between academia and industry through skill-based education. Operating under the motto 'Nation Building Through Skills', EduSkills has partnered with leading global technology companies including Google, AWS, Microsoft, and others to deliver virtual internship programs approved by AICTE (All India Council for Technical Education)."
          ),
          boldPara(
            "b. Business Size: ",
            "EduSkills operates as a pan-India initiative, having trained and certified hundreds of thousands of students across various engineering and technology disciplines. The organization works with thousands of institutions and has a significant digital presence through its online learning portal."
          ),
          boldPara(
            "c. Product Lines / Services: ",
            "EduSkills offers AICTE-approved virtual internship programs in domains including Cloud Computing (Google Cloud, AWS, Azure), Cybersecurity, Artificial Intelligence, Data Analytics, and more. The curriculum is co-created with industry partners to ensure relevance and quality."
          ),
          boldPara(
            "d. Competitors: ",
            "Similar organizations in this space include Internshala, Let's Intern, IBM SkillsBuild, and Microsoft Learn, though EduSkills is distinctive in its AICTE approval and structured semester-aligned virtual internship format."
          ),
          boldPara(
            "e. Departments: ",
            "EduSkills operates key departments including Curriculum Development (in partnership with Google Cloud), Student Enrollment and Support, Assessment and Certification, Institutional Partnerships, and Technology/Platform Management for delivering the online programs."
          ),

          pageBreak(),

          heading("CHAPTER 2", HeadingLevel.HEADING_1),
          heading("TECHNICAL DESCRIPTION", HeadingLevel.HEADING_2),
          new Paragraph({ spacing: { after: 200 } }),
          para(
            "This chapter provides a technical overview of the tools, technologies, and platforms that form the foundation of the Google Cloud Cybersecurity internship."
          ),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "2.1 Google Cloud Platform (GCP)",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),
          para(
            "Google Cloud Platform is a suite of cloud computing services that runs on the same infrastructure Google uses internally for its end-user products. GCP provides services across computing, storage, databases, machine learning, and security. For this internship, the focus is on GCP's security-specific services including:"
          ),
          bulletPara(
            "Security Command Center (SCC): A centralized security and risk management platform for GCP that provides visibility, threat detection, and compliance monitoring."
          ),
          bulletPara(
            "Cloud Armor: A DDoS protection and web application firewall (WAF) service that defends applications from Layer 3 to Layer 7 attacks."
          ),
          bulletPara(
            "Chronicle SIEM: Google's cloud-native Security Information and Event Management platform for threat detection and investigation."
          ),
          bulletPara(
            "Cloud IAM: Manages access control for GCP resources using roles, policies, and service accounts."
          ),
          bulletPara(
            "VPC Service Controls: Creates security perimeters around GCP resources to mitigate data exfiltration risks."
          ),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "2.2 Key Technologies and Concepts",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),
          para(
            "The internship covers a range of technical concepts essential to modern cloud security practice:"
          ),
          bulletPara(
            "Infrastructure as Code (IaC): Using Terraform and Deployment Manager to define and manage cloud infrastructure programmatically, enabling security policies to be version-controlled and auditable."
          ),
          bulletPara(
            "Policy as Code: Implementing security and compliance policies as code using tools like Open Policy Agent (OPA), ensuring consistent and automated enforcement of security rules."
          ),
          bulletPara(
            "Container and Serverless Security: Securing containerized workloads using Google Kubernetes Engine (GKE) security features, Binary Authorization, and serverless security controls for Cloud Functions."
          ),
          bulletPara(
            "Zero Trust Architecture: Implementing the principle of 'never trust, always verify' using BeyondCorp Enterprise and context-aware access policies."
          ),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "2.3 Week-wise Technical Coverage",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),
          new Table({
            width: { size: 9026, type: WidthType.DXA },
            columnWidths: [1200, 3000, 4826],
            rows: [
              new TableRow({
                children: [
                  headerCell("Week"),
                  headerCell("Module"),
                  headerCell("Technical Focus"),
                ],
              }),
              new TableRow({
                children: [
                  cell("1"),
                  cell("Security Principles in Cloud"),
                  cell(
                    "Cloud fundamentals, deployment models, virtualization, containerization"
                  ),
                ],
              }),
              new TableRow({
                children: [
                  cell("2"),
                  cell("Security Principles in Cloud"),
                  cell(
                    "Layered security, IAM, shared responsibility, DevSecOps, IaC"
                  ),
                ],
              }),
              new TableRow({
                children: [
                  cell("3"),
                  cell("Risk Management"),
                  cell(
                    "Risk frameworks, CSPM, Security Command Center, policy as code"
                  ),
                ],
              }),
              new TableRow({
                children: [
                  cell("4"),
                  cell("Identity & Threat Protection"),
                  cell("AAA, credential handling, zero trust, perimeter protection"),
                ],
              }),
              new TableRow({
                children: [
                  cell("5"),
                  cell("Cloud-Native Security"),
                  cell(
                    "Asset management, IaC automation, container security, data governance"
                  ),
                ],
              }),
              new TableRow({
                children: [
                  cell("6"),
                  cell("Detect & Respond"),
                  cell(
                    "Incident response, threat monitoring, vulnerability management"
                  ),
                ],
              }),
              new TableRow({
                children: [
                  cell("7"),
                  cell("Detect & Respond"),
                  cell("Threat hunting, playbooks, BCDR, system recovery"),
                ],
              }),
              new TableRow({
                children: [
                  cell("8"),
                  cell("Capstone & Career Prep"),
                  cell("Capstone project, resume refinement, interview preparation"),
                ],
              }),
            ],
          }),

          pageBreak(),

          heading("CHAPTER 3", HeadingLevel.HEADING_1),
          heading("SYSTEM DESIGN", HeadingLevel.HEADING_2),
          new Paragraph({ spacing: { after: 200 } }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "3.1 General Architecture",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),
          para(
            "The Google Cloud security architecture follows a layered defense-in-depth model. At the outermost layer, Cloud Armor provides DDoS protection and WAF capabilities. The network layer is secured using VPC, firewall rules, and VPC Service Controls. The identity layer is governed by Cloud IAM, enforcing least-privilege access using roles, service accounts, and organizational policies. The data layer uses Cloud KMS for encryption and DLP (Data Loss Prevention) APIs for data classification. Security Command Center serves as the centralized monitoring and visibility hub, integrating threat intelligence from all layers."
          ),
          para(
            "[Figure 3.1 - General Architecture of Google Cloud Security to be inserted here]",
            { italics: true, color: "888888" }
          ),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "3.2 Design Phase",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 120, after: 100 },
            children: [
              new TextRun({
                text: "3.2.1 Data Flow Diagram",
                bold: true,
                size: 24,
                font: "Times New Roman",
              }),
            ],
          }),
          para(
            "The data flow in a Google Cloud security environment begins with user/application requests reaching Cloud Armor for DDoS filtering. Authenticated requests pass through IAM checks and VPC Service Controls before reaching compute or storage resources. All access events are logged to Cloud Audit Logs, which feed into Chronicle SIEM for real-time analysis. Alerts generated by Security Command Center trigger automated incident response playbooks."
          ),
          para("[Figure 3.2 - Data Flow Diagram to be inserted here]", {
            italics: true,
            color: "888888",
          }),

          new Paragraph({
            spacing: { before: 120, after: 100 },
            children: [
              new TextRun({
                text: "3.2.2 UML Diagrams",
                bold: true,
                size: 24,
                font: "Times New Roman",
              }),
            ],
          }),
          para(
            "Use Case Diagram: The primary actors include Cloud Administrator, Security Analyst, Developer (DevSecOps), and Attacker (external threat). Core use cases include: Configure IAM Policies, Monitor Security Alerts, Respond to Incidents, Conduct Vulnerability Scans, and Manage Firewall Rules."
          ),
          para(
            "Sequence Diagram: Illustrates the incident response flow - from threat detection by Security Command Center, alert generation, notification to SOC analyst, investigation using Chronicle SIEM, and automated or manual remediation using Cloud Functions or playbooks."
          ),
          para("[Figure 3.3 - UML Diagram to be inserted here]", {
            italics: true,
            color: "888888",
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "3.3 Methodology",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),
          para(
            "The internship follows a structured, module-based learning methodology aligned with the Google Cloud Cybersecurity Professional Certificate framework. Each week builds upon the previous, following a progressive knowledge accumulation approach:"
          ),
          bulletPara("Conceptual Learning: Video lectures and readings on each topic."),
          bulletPara(
            "Hands-On Labs: Qwiklabs/Google Cloud Skills Boost labs for practical experience."
          ),
          bulletPara(
            "Weekly Assessments: Quizzes and assignments to reinforce understanding."
          ),
          bulletPara(
            "Capstone Project: A culminating project in Week 8 applying all concepts to a real-world cloud security scenario."
          ),

          pageBreak(),

          heading("CHAPTER 4", HeadingLevel.HEADING_1),
          heading("SYSTEM IMPLEMENTATION", HeadingLevel.HEADING_2),
          new Paragraph({ spacing: { after: 200 } }),
          para(
            "Note: As the internship is currently in progress (April 2026 - June 2026), the implementation phase is ongoing. This chapter will be updated upon completion of the program.",
            { italics: true }
          ),
          new Paragraph({ spacing: { after: 200 } }),
          para(
            "The implementation activities are structured week-by-week as per the internship curriculum. Key implementation steps planned or underway include:"
          ),
          bulletPara(
            "Setting up Google Cloud environment and IAM role configurations for least-privilege access."
          ),
          bulletPara(
            "Configuring VPC networks, firewall rules, and Cloud Armor security policies."
          ),
          bulletPara(
            "Enabling and configuring Security Command Center for threat detection and asset inventory."
          ),
          bulletPara(
            "Implementing IaC security policies using Terraform templates."
          ),
          bulletPara(
            "Completing hands-on labs for container security (GKE), serverless security (Cloud Functions), and data protection (DLP API)."
          ),
          bulletPara(
            "Designing and executing an incident response playbook for a simulated cloud security breach."
          ),
          para(
            "[Source code and lab screenshots to be added in Appendix 7.1 upon completion]",
            { italics: true, color: "888888" }
          ),

          pageBreak(),

          heading("CHAPTER 5", HeadingLevel.HEADING_1),
          heading("RESULTS AND DISCUSSIONS", HeadingLevel.HEADING_2),
          new Paragraph({ spacing: { after: 200 } }),
          para(
            "Note: As the internship is currently in progress, final results are not yet available. This chapter will be completed upon finishing all assessments and the capstone project. The following outlines the expected outcomes.",
            { italics: true }
          ),
          new Paragraph({ spacing: { after: 200 } }),
          para(
            "Upon successful completion of the 8-week program, the following results are anticipated:"
          ),
          bulletPara(
            "Completion of all 8 weekly assessment modules with satisfactory scores."
          ),
          bulletPara(
            "Successful submission of project documentation and assignments for applicable modules."
          ),
          bulletPara("Qualifying performance in the Final Assessment Test."),
          bulletPara(
            "Completion of a capstone project demonstrating applied cloud security skills."
          ),
          bulletPara(
            "Earning the Virtual Internship Completion Certificate from AICTE - EduSkills."
          ),
          para(
            "The internship is expected to validate practical knowledge of Google Cloud security tools and enhance readiness for industry roles such as Cloud Security Analyst, Cloud Security Engineer, or Security Operations Center (SOC) Analyst."
          ),

          pageBreak(),

          heading("CHAPTER 6", HeadingLevel.HEADING_1),
          heading("CONCLUSION AND FUTURE WORK", HeadingLevel.HEADING_2),
          new Paragraph({ spacing: { after: 200 } }),
          para(
            "This internship in Google Cloud Cybersecurity, conducted under the AICTE - EduSkills Virtual Internship Program, represents a comprehensive and structured exposure to one of the most in-demand domains in the technology industry. The 8-week program covers the complete lifecycle of cloud security - from foundational principles to advanced threat detection, response, and recovery - aligned with Google Cloud's professional certification curriculum."
          ),
          para(
            "The program is anticipated to significantly enhance technical skills in cloud security, improve understanding of real-world security challenges faced by organizations using GCP, and develop readiness for a career as a Cloud Security Analyst. The combination of conceptual learning, hands-on labs, weekly assessments, and a capstone project ensures both theoretical depth and practical competence."
          ),
          para(
            "Future Work: Upon completion of this internship, the following next steps are planned:"
          ),
          bulletPara(
            "Pursuing the Google Professional Cloud Security Engineer certification to formally validate skills acquired."
          ),
          bulletPara(
            "Building personal projects on GCP to deepen practical experience with cloud security tools."
          ),
          bulletPara(
            "Exploring advanced topics such as AI-powered threat detection, cloud forensics, and multicloud security management."
          ),

          pageBreak(),

          heading("CHAPTER 7", HeadingLevel.HEADING_1),
          heading("APPENDICES", HeadingLevel.HEADING_2),
          new Paragraph({ spacing: { after: 200 } }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "7.1 Source Code",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),
          para(
            "Note: Source code and lab screenshots from hands-on GCP labs will be added here upon completion of the internship program.",
            { italics: true, color: "888888" }
          ),
          para("Sample IaC code for IAM policy (to be expanded upon completion):"),
          codeLine('resource "google_project_iam_binding" "viewer" {'),
          codeLine("  project = var.project_id"),
          codeLine('  role    = "roles/viewer"'),
          codeLine('  members = ["user:example@domain.com"]'),
          codeLine("}"),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "7.2 Learning Experiences",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),
          boldPara(
            "a. Knowledge Acquired: ",
            "Through this internship, significant knowledge is being gained in cloud security architecture, including how security is implemented across cloud service models (IaaS, PaaS, SaaS). Concepts from academic courses such as Network Security, Operating Systems, and Software Engineering are being applied in the context of Google Cloud's security ecosystem. The shared responsibility model, for instance, directly connects to OS-level security concepts studied in coursework."
          ),
          boldPara(
            "b. Skills Learned: ",
            "Practical skills being developed include configuring IAM policies, setting up firewall rules and VPC configurations, using Security Command Center for threat visibility, writing IaC templates, and understanding incident response workflows. Soft skills such as structured problem-solving, self-directed learning, and time management across weekly assessment deadlines are also being strengthened."
          ),
          boldPara(
            "c. Observed Attitudes and Values: ",
            "The internship has reinforced the importance of a security-first mindset - the principle that security must be integrated at every stage of system design, not added as an afterthought. Values such as diligence in following security protocols, intellectual curiosity in exploring new cloud technologies, and accountability in completing weekly assessments on time have been significant takeaways."
          ),
          boldPara(
            "d. Most Challenging Task: ",
            "The most challenging aspect of the internship is understanding and implementing zero-trust architecture within a cloud environment. Moving away from perimeter-based security thinking to identity-centric, context-aware access control requires a fundamental shift in approach. Overcoming this challenge involved revisiting core IAM concepts, studying Google's BeyondCorp documentation, and applying concepts in hands-on labs to build practical intuition."
          ),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "7.3 SWOT Analysis",
                bold: true,
                size: 26,
                font: "Times New Roman",
              }),
            ],
          }),
          para("SWOT Analysis of EduSkills as an Organization:"),
          new Table({
            width: { size: 9026, type: WidthType.DXA },
            columnWidths: [4513, 4513],
            rows: [
              new TableRow({
                children: [headerCell("STRENGTHS"), headerCell("WEAKNESSES")],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders,
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    width: { size: 4513, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 AICTE-approved programs lend high credibility.",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 Partnership with top global companies (Google, AWS, Microsoft).",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 Accessible virtual format suits students across India.",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 Curriculum co-designed with industry partners ensures relevance.",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders,
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    width: { size: 4513, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 No stipend offered, limiting motivation for some students.",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 Virtual format lacks in-person mentorship and networking.",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 Limited lab time on actual cloud platforms for free-tier users.",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [headerCell("OPPORTUNITIES"), headerCell("THREATS")],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders,
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    width: { size: 4513, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 Growing demand for cloud security professionals globally.",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 Expansion into Tier 2 and Tier 3 cities through digital delivery.",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 Increasing government focus on digital skilling initiatives in India.",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders,
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    width: { size: 4513, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 Competition from other edtech platforms offering similar programs.",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 Risk of students not completing programs due to lack of accountability.",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "\u2022 Rapid changes in cloud technology requiring frequent curriculum updates.",
                            font: "Times New Roman",
                            size: 22,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

async function main() {
  const outputArg = process.argv[2];
  const outputPath = outputArg
    ? path.resolve(process.cwd(), outputArg)
    : path.resolve(process.cwd(), "internship_report.docx");

  const doc = createDocument();
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Report written to ${outputPath}`);
}

main().catch((error) => {
  console.error("Failed to generate report:", error);
  process.exit(1);
});
