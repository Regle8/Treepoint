/**
 * Editorial copy. British English throughout.
 */

export const HERO = {
  headline: ['Considered', 'arboriculture', 'for considered', 'places.'],
  sub:
    'An independent arboricultural practice working with developers, architects, and landowners across the south of England and south Wales.',
  scrollHint: 'Scroll to begin the year',
};

export const ABOUT = {
  label: 'About',
  numeral: '01',
  heading: 'A practice built around the trees themselves, not the paperwork.',
  body: [
    'Treepoint Consultants is an independent arboricultural practice based in London. It was established to provide considered arboricultural counsel to clients who value precision and clarity over volume: a small range of services, done properly, by a single experienced hand.',
    'Every commission is treated as a bespoke matter. Reports are written by hand, not generated from templates, and every tree is inspected in person. Findings are produced to the standards expected by planning authorities, the Arboricultural Association, and where required, the courts.',
    'Based in London, the practice regularly works across Greater London, Surrey, Kent, Sussex, Hampshire, Berkshire, Oxfordshire, Buckinghamshire, Hertfordshire, Essex, and the south Wales corridor including Cardiff, Newport, Monmouthshire, and Swansea. Site visits further afield are arranged by agreement.',
    'Clients include property developers, architects, landscape architects, planning consultants, solicitors, estate managers, and private landowners.',
  ],
};

export const PRINCIPLES = {
  label: 'Principles',
  numeral: '02',
  heading: 'How the work is done.',
  sub: 'Six principles that hold across every commission, every scale, every season.',
  items: [
    {
      n: '01',
      title: 'Evidence before opinion',
      body:
        'Every conclusion is supported by site evidence: measurements, photographs, and instrument readings where appropriate. Opinion follows from evidence, not the other way around. Where evidence is absent or genuinely ambiguous, the report says so plainly, and the reasoning sets out what would resolve it.',
    },
    {
      n: '02',
      title: 'Plain English',
      body:
        'Reports are written to be read by the people who will rely on them: planning officers, contractors, solicitors, owners. Technical accuracy comes first; plain language carries it. Jargon is avoided where a plain word will do, and the British Standards are translated, not transcribed.',
    },
    {
      n: '03',
      title: 'Fixed fees',
      body:
        'A quote is agreed in writing before any work begins, with the scope explicitly stated. There are no surprises on the invoice. Where scope changes during an instruction (additional trees, a revised layout, a fresh round of officer comments), the variation is agreed in advance, not negotiated after the fact.',
    },
    {
      n: '04',
      title: 'Tree first thinking',
      body:
        'Where retention and development can be reconciled, the work argues for retention. Mature trees take decades to grow and cannot be replaced inside the timeframe of a single application. Layout adjustments that preserve a significant specimen almost always pay back, in both planning terms and the long life of the site.',
    },
    {
      n: '05',
      title: 'The long view',
      body:
        'Recommendations consider the tree\'s likely condition twenty, forty, and sixty years on. A defensible report has to survive determination, the discharge of conditions, the construction phase, and the years after handover, not just the planning officer\'s first read.',
    },
    {
      n: '06',
      title: 'Specific to your site',
      body:
        'No two sites are alike, and no two reports should be either. Every report is written from scratch for the trees on the ground, not assembled from templates. The reasoning is your reasoning; the precedents cited are precedents that bear on your application.',
    },
  ],
};

export const SERVICES_LABEL = {
  label: 'Services',
  numeral: '03',
  sub: 'The full range of arboricultural consultancy, applied with care.',
};

export type Service = {
  numeral: string;
  title: string;
  body: string;
  triggers: string[];
  deliverables: string[];
  turnaround: string;
};

export const SERVICES: Service[] = [
  {
    numeral: '01',
    title: 'BS 5837. Trees on development sites',
    body:
      'BS 5837:2012 is the British Standard governing how trees are surveyed, categorised, and protected on any site where development is proposed. A BS 5837 report is the foundation document submitted with planning applications affecting trees, and it informs every subsequent stage of design: what can be built, where it can be built, and what mitigation is required. Where the report is robust, the rest of the application follows. Where it is thin, the trees become a problem that compounds at every later stage.',
    triggers: [
      'Planning application on a site containing trees',
      'Preapplication advice from the planning authority',
      'Due diligence before purchasing a development site',
      'Design team needing a tree constraints plan to inform layout',
    ],
    deliverables: [
      'Detailed survey schedule of every tree on or affecting the site',
      'Tree constraints plan showing Root Protection Areas and canopy spreads',
      'Category assessments (A, B, C, U) with retention rationale',
    ],
    turnaround: '2 to 4 weeks',
  },
  {
    numeral: '02',
    title: 'Tree surveys',
    body:
      'Detailed inventories of trees on a site, recording species, condition, age class, dimensions (height, stem diameter, crown spread), physiological and structural condition, and recommended works. Surveys may cover individual specimens, groups, woodland, or full estates. The schedule is set up to be used: by an estate manager planning works, by a buyer assessing liability, by a planner reading an application, by a contractor pricing the job.',
    triggers: [
      'Managing an estate, large garden, or institutional grounds',
      'Ongoing tree maintenance and inspection planning',
      'Prepurchase due diligence',
      'Insurance requirements; storm damage assessment',
    ],
    deliverables: [
      'Tagged tree schedule (paper, PDF, and editable spreadsheet)',
      'Condition report with photographs',
      'Management recommendations with priorities and timings',
    ],
    turnaround: '1 to 3 weeks',
  },
  {
    numeral: '03',
    title: 'Arboricultural Impact Assessments (AIA)',
    body:
      'An AIA evaluates how a specific development proposal will affect retained trees, predicting impacts on roots within the Root Protection Area, canopy clearance, light and microclimate, and the trees\' long term viability after construction. The AIA also proposes mitigation: design changes, foundation specifications, protective measures, or replacement planting where loss is genuinely unavoidable. It is the document that turns a constraints plan into a planning argument.',
    triggers: [
      'Detailed planning application where trees will be retained',
      'Refinement of layout to reduce tree loss',
      'Response to planning officer comments or refusal',
      'Appeal against a planning refusal involving trees',
    ],
    deliverables: [
      'Written AIA report aligned with BS 5837',
      'Tree loss schedule and justifications',
      'Mitigation proposals and replacement planting strategy',
    ],
    turnaround: '2 to 3 weeks',
  },
  {
    numeral: '04',
    title: 'Arboricultural Method Statements (AMS)',
    body:
      'Where construction will take place within Root Protection Areas or otherwise close to retained trees, an AMS sets out, in technical detail, how the works will proceed without causing damage. This includes foundation type, services routing, ground protection measures, hand dig zones, and any required arboricultural supervision. The AMS is a contractor facing document; it must be unambiguous on site, not just on a planner\'s desk.',
    triggers: [
      'Planning condition requiring an AMS before construction',
      'Foundations or services routed within an RPA',
      'Hard surfacing or level changes near retained trees',
      'Demolition adjacent to retained trees',
    ],
    deliverables: [
      'Written method statement, drawing referenced',
      'Supervised works schedule with monitoring intervals',
      'Sign off certifications at the agreed stages',
    ],
    turnaround: '2 weeks',
  },
  {
    numeral: '05',
    title: 'Tree Protection Plans (TPP)',
    body:
      'A construction stage drawing showing the location of tree protection fencing, ground protection zones, exclusion areas, and any specified construction details, used by contractors on site and submitted to discharge planning conditions. The TPP is the document the site manager pins to the wall; it has to be unambiguous, durable in a wet folder, and consistent with the AMS and AIA that preceded it.',
    triggers: [
      'Planning condition requiring a TPP',
      'Contractor mobilisation onto a site with retained trees',
      'Site meeting before commencement with the planning authority',
    ],
    deliverables: [
      'Scaled TPP drawing in PDF and CAD',
      'Written specification of protection measures',
      'Contractor briefing notes where required',
    ],
    turnaround: '1 to 2 weeks',
  },
  {
    numeral: '06',
    title: 'Tree Preservation Orders & Conservation Areas',
    body:
      'Many trees in England and Wales are protected by Tree Preservation Orders, or by virtue of standing within a designated Conservation Area. Works to protected trees require formal consent under the Town and Country Planning (Tree Preservation) (England) Regulations 2012. Failure to obtain it can result in an unlimited fine and prosecution of those instructing the works. Treepoint advises on the practical implications, prepares applications and Section 211 notifications, and represents clients at appeal where refusal warrants it.',
    triggers: [
      'Planned works to a protected tree',
      'Refusal of a TPO application',
      'Considering a property purchase where TPOs apply',
      'Enforcement notice or alleged breach',
    ],
    deliverables: [
      'TPO application or Section 211 notification',
      'Supporting arboricultural justification',
      'Appeal documents where required',
    ],
    turnaround: '1 to 2 weeks for application preparation',
  },
  {
    numeral: '07',
    title: 'Tree safety, hazard, and failure investigations',
    body:
      'A duty of care exists in common law for landowners to ensure trees on their property do not present an unreasonable risk to people or property. Treepoint conducts systematic tree safety inspections (typically following the QTRA or VALID frameworks), diagnoses pest and disease problems, and investigates the circumstances of tree failures, including expert evidence where matters reach litigation. The inspection is the start of the duty of care, not the end; the management programme that follows is what defends the landowner.',
    triggers: [
      'Trees adjacent to roads, footpaths, railways, or buildings',
      'Visible decay, dieback, or fungal fruiting bodies',
      'Following high winds, or after a failure has caused damage or injury',
      'Preparing a defence against a claim',
    ],
    deliverables: [
      'Inspection report with risk ratings and photographs of every tree',
      'Recommended remedial actions and prioritisation schedule',
      'Reinspection schedule and management programme',
    ],
    turnaround: '1 to 2 weeks for routine inspection; longer for investigations',
  },
  {
    numeral: '08',
    title: 'Decay detection & advanced diagnostics',
    body:
      'Visual inspection has limits. Where internal decay is suspected (most often in mature urban trees in high target settings), noninvasive instruments are deployed: sonic tomography (PiCUS), resistograph drilling, and aerial inspection by climbing or pole camera where the canopy needs eyes on it. The diagnostic informs the management decision: retain, monitor, reduce, or fell. Where the answer is "retain", the report explains why.',
    triggers: [
      'Visible decay or hollow at the trunk base',
      'Fungal fruiting bodies on or near the trunk or root plate',
      'Cavities above ground level',
      'Mature tree in a high target setting (alongside roads, buildings, playgrounds)',
    ],
    deliverables: [
      'Tomography images with interpretation',
      'Resistograph traces and analysis',
      'Climbing or pole camera inspection record',
      'Management recommendation with reasoning',
    ],
    turnaround: '2 to 3 weeks (including instrument hire)',
  },
  {
    numeral: '09',
    title: 'Veteran & ancient tree assessment',
    body:
      'Ancient and veteran trees are afforded particular protection under the National Planning Policy Framework, recognised as irreplaceable habitats. Their assessment requires specific competence: identifying the features that confer ancient or veteran status, valuing them in planning terms, and proposing management compatible with their conservation. Treepoint assesses, records, and reports on individual specimens and groups, working from the Ancient Tree Inventory and the Forestry Commission\'s veteran tree guidance.',
    triggers: [
      'Site contains potential ancient or veteran trees',
      'Planning authority requires veteran tree assessment',
      'Estate review of irreplaceable habitat or designed landscape',
      'Disagreement with the planning authority over a tree\'s status',
    ],
    deliverables: [
      'Assessment report referencing the Ancient Tree Inventory and NPPF',
      'Veteran or ancient categorisation with photographic record',
      'Conservation management recommendations',
    ],
    turnaround: '2 to 3 weeks',
  },
];

export const APPROACH = {
  label: 'Approach',
  numeral: '04',
  heading: 'Four steps. No surprises.',
  sub: 'Every project, every scale. The detail expands; the rhythm does not.',
  steps: [
    {
      n: '01',
      title: 'The brief',
      body:
        'An initial call or email at no cost, normally answered the same day. Scope is clarified in writing: which trees, what protections apply, what planning context, what deadline. A fixed fee is quoted before any work begins, with no surprises on invoicing. NDAs and confidentiality undertakings are accepted where required, and it is normal practice to agree confidentiality at the brief stage rather than later.',
    },
    {
      n: '02',
      title: 'Site visit',
      body:
        'Every tree relevant to the commission is inspected in person, measured, and photographed. Where access is restricted or trees are tall, equipment is brought to suit: pole cameras for crown inspection, sonic tomographs and resistograph drills where internal decay is suspected, climbing inspection where the canopy demands it. Site visits are scheduled within one to two weeks of instruction in most cases, sooner where the matter is genuinely urgent.',
    },
    {
      n: '03',
      title: 'The report',
      body:
        'Findings, recommendations, and supporting plans are prepared in accordance with the relevant British Standards and submitted ready for the planning portal. Reports are written from scratch, not assembled from templates. The arboricultural reasoning is specific to your site, your trees, and your application. Drafts are issued for comment before the final version where the timetable allows, and the report is delivered when it was promised.',
    },
    {
      n: '04',
      title: 'Ongoing counsel',
      body:
        "Availability continues through determination of the application, discharge of conditions, and into the construction phase. Where an AMS specifies arboricultural supervision of particular operations, site visits are arranged on the relevant dates and the works signed off. Telephone advice on minor queries is offered without further charge to existing clients. It is in everyone's interest that the trees, the application, and the contractor remain aligned.",
    },
  ],
};

export const FAQ = {
  label: 'Questions',
  numeral: '05',
  heading: 'The questions clients usually ask first.',
  sub: "If the answer to yours isn't below, please ask. There is no charge for an initial enquiry.",
  items: [
    {
      q: 'Do I need a BS 5837 report for my planning application?',
      a: "If your site contains any trees that could be affected by the development, or any trees within falling distance of the proposed works, then almost certainly yes. Many planning authorities will reject an application as invalid without one. Where there's doubt, a preapplication enquiry to the planning officer will confirm.",
    },
    {
      q: 'What is a Root Protection Area, and why does it matter?',
      a: "The Root Protection Area is a calculated zone around a tree (typically twelve times the stem diameter, expressed as a circle or polygon) within which construction activity is restricted to protect the tree's roots. Roots within this area are essential to the tree's stability and water uptake. Damaging them (through trenching, compaction, or chemical contamination) can kill the tree, often years after the works.",
    },
    {
      q: 'What is the difference between a Category A, B, C, and U tree?',
      a: 'Under BS 5837, trees are classified by quality and longevity. Category A trees are of high quality with a remaining life expectancy of forty years or more; Category B is moderate quality with twenty years or more; Category C is low quality with ten years or more; Category U trees are unsuitable for retention. The category influences how strongly the planning system protects the tree from removal.',
    },
    {
      q: 'Can I remove a tree with a TPO?',
      a: 'Only with formal consent from the planning authority. Application is made on the standard form with supporting arboricultural justification. Exceptions exist for trees that are dead or that pose an immediate risk, but the safest course is to seek written agreement before any works, and to keep photographic evidence of the condition that justified them.',
    },
    {
      q: 'What happens if I work on a protected tree without permission?',
      a: "In England and Wales, unauthorised works to a TPO'd tree or a Conservation Area tree can attract a fine of up to £20,000 in the Magistrates' Court, or an unlimited fine if tried on indictment in the Crown Court. Liability extends to those instructing the works as well as the contractor who carries them out.",
    },
    {
      q: 'Do you cover my area?',
      a: 'Treepoint is based in London and routinely covers Greater London, the Home Counties, the south of England, and south Wales. Site visits beyond this radius are arranged by agreement. Get in touch. There is a good chance the answer is yes.',
    },
    {
      q: 'How much does a report cost?',
      a: 'Fees depend on the number of trees, the site complexity, and the report type. A straightforward survey for a small site might start in the low hundreds; a complex AIA and AMS package for a multiphase development will be considerably more. A fixed fee is quoted in writing before any work begins.',
    },
    {
      q: 'How quickly can you turn a report around?',
      a: 'For straightforward instructions, two to four weeks from initial brief to final report is typical. Urgent matters can sometimes be expedited; please ask. The site visit is usually scheduled within a week of instruction.',
    },
    {
      q: 'Will you push back if the design needs to change to retain a tree?',
      a: 'Yes. Where retention is the right answer, the report says so, and the reasoning is set out clearly. Layout adjustments that preserve significant trees almost always pay back in planning terms. The work is to find that argument, not to wave it through.',
    },
  ],
};

export const CONTACT = {
  label: 'Contact',
  numeral: '06',
  heading: 'Start a quiet conversation.',
  intro:
    'Every brief begins in writing. Tell us what you have, what you need, and when. You will hear back within one working day.',
  formCta: 'Send the first note',
  formSent: 'Thank you. Your message has been received.',
  fields: {
    name: 'Your name',
    organisation: 'Organisation (optional)',
    email: 'Email',
    phone: 'Telephone (optional)',
    postcode: 'Site postcode',
    service: 'Service required',
    message: 'A first note',
  },
  serviceOptions: [
    'Not yet sure. Please advise',
    'BS 5837 development survey',
    'Tree survey',
    'Arboricultural Impact Assessment',
    'Method Statement or Protection Plan',
    'Tree Preservation Order',
    'Tree safety or hazard inspection',
    'Decay detection or advanced diagnostics',
    'Veteran or ancient tree assessment',
    'Other',
  ],
  notes: [
    'Office hours: Monday to Friday, 9am to 5.30pm. Site visits arranged outside these hours by agreement.',
    'Initial enquiries acknowledged within one working day.',
  ],
};

export const FOOTER = {
  practice: 'Treepoint Consultants',
  tagline: 'Considered arboriculture for considered places.',
  contactCta: {
    line: 'Every enquiry begins with a written note.',
    label: 'Send the first note',
    href: '#contact',
  },
  serviceAreas: {
    label: 'Where we work',
    items: [
      'Greater London',
      'Surrey, Kent & Sussex',
      'Hampshire & Berkshire',
      'Oxfordshire & Buckinghamshire',
      'Hertfordshire & Essex',
      'Cardiff, Newport, Swansea & Monmouthshire',
      'Further afield by agreement',
    ],
  },
  servicesShort: {
    label: 'Services',
    items: [
      'BS 5837 development surveys',
      'Tree surveys & inventories',
      'Arboricultural Impact Assessments',
      'Method Statements & Protection Plans',
      'Tree Preservation Order advice',
      'Tree safety inspections',
      'Decay detection & diagnostics',
      'Veteran & ancient tree assessment',
    ],
  },
  professional: {
    label: 'Professional',
    items: [
      'Arboricultural Association (Technician Member)',
      'Institute of Chartered Foresters (Associate)',
      'BSc (Hons), Tech Cert (ArborA)',
      'Professional Indemnity Insured',
      'Public Liability Insured',
    ],
  },
  practiceNotes: {
    label: 'Practice',
    items: [
      'Office hours: Mon to Fri, 9am to 5.30pm',
      'Initial enquiries answered within one working day',
      'Fixed fees agreed before any work begins',
      'NDAs and confidentiality undertakings accepted',
    ],
  },
  links: {
    label: 'Site',
    items: [
      { label: 'About', href: '#about' },
      { label: 'Principles', href: '#principles' },
      { label: 'Services', href: '#services' },
      { label: 'Approach', href: '#approach' },
      { label: 'Questions', href: '#faq' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  rights: '© Treepoint Consultants. Considered arboriculture.',
};
