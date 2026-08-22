import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Search, ExternalLink } from "lucide-react";

const GALLERY_IMAGES = [
  // Emotional & Regulation
  { title: "Emotional Flashbacks Explained", category: "Emotional Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/9c693b0dd_EmotionalFlashbacksExplained.jpg" },
  { title: "Fear of Mistakes", category: "Emotional Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/a1dc6f494_FearofMistakes.jpg" },
  { title: "Baseline Anxiety", category: "Emotional Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/1eee3a02d_BaselineAnxiety.jpg" },
  { title: "Internal Overwhelm", category: "Emotional Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/f5e8e1926_InternalOverwhelm.jpg" },
  { title: "Top 10 Tips for Emotional Regulation", category: "Emotional Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/51ddcafcd_Top10TipsforEmotionalRegulation.jpg" },
  { title: "Perfectionism", category: "Emotional Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/eb4a1ec62_Perfectionism.png" },
  { title: "Not Being Dramatic – Feeling Real Discomfort", category: "Emotional Regulation", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/a94af1521_NotBeingDramatic-FeelingRealDiscomfort.jpg" },
  // Sensory Decoding
  { title: "Sensory Decoding", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e71b79255_SensoryDecoding.jpg" },
  { title: "Decoding: Behaviour vs Sensory Need", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/614bb3984_DecodingBehaviourIsSensoryNeed.jpg" },
  { title: "Decoding Sensory Aggression", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0448eff86_DecodingSensoryAggression.jpg" },
  { title: "Decoding Sensory Diet", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c91f8cf0f_DecodingSensoryDiet.jpg" },
  { title: "Decoding: The Impact – Why Sensory Challenges Matter", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/fba5d0bb3_DecodingtheImpact-WhySensoryChallengesMatter.jpg" },
  { title: "Decoding: The Biological Side of Sensory Masking", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/3e1bf4194_Decoding-TheBiologicalSideofSensoryMasking.jpg" },
  { title: "Body-Word Disconnect", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/bac8ebe04_Body-WordDisconnect.jpg" },
  { title: "Autistic Sensory Decoding – Supporting Mental Health", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/9a2131c14_AutisticSensoryDecoding-SupportingMentalHealth.jpg" },
  { title: "Sensory Decoding – A Nervous System That Has Reached Its Limit", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/5cae640da_SensoryDecoding-ANervousSystemThatHasReachedItsLimit.jpg" },
  { title: "Sensory Decoding – Apply Sensory Regulation Strategies in Class", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/49ef1698f_SensoryDecoding-ApplySensoryRegulationStrategiesinClass.jpg" },
  { title: "Sensory Decoding – Decoding Your Child Has Very Deep Feelings", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/516dc9fbd_SensoryDecoding-DecodingYourChildHasVeryDeepFeelings.jpg" },
  { title: "Sensory Decoding – Do Autistic Children Point?", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/aac122394_SensoryDecoding-DoAutisticChildrenPoint.jpg" },
  { title: "Sensory Decoding – Explanation of How to Help Your Autistic Child Regulate", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/7027f00a0_SensoryDecoding-ExplanationofHowtoHelpYourAutisticChildRegulate.jpg" },
  { title: "Sensory Decoding – Fight/Flight Activation", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/691df002e_SensoryDecoding-FightFlightActivation.jpg" },
  { title: "Sensory Decoding – Food Textures and Temperature", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/10587380c_SensoryDecoding-FoodTexturesandTemperature.jpg" },
  { title: "Sensory Decoding – Is It All Communication?", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/a0e509ccb_SensoryDecoding-IsItAllCommunication.jpg" },
  { title: "Sensory Decoding – Like vs Love, Dislike vs Strong Dislike", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/484d24be8_SensoryDecoding-LikevsLoveDislikevsStrongDislike.jpg" },
  { title: "Sensory Decoding – Managing Meltdowns and Aggression", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/4a8e8eb9c_SensoryDecoding-ManagingMeltdownsandAggression.jpg" },
  { title: "Sensory Decoding – Needing to Clean the Showerhead After Every Shower", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/1d95c7937_SensoryDecoding-NeedingtoCleantheShowerheadAfterEveryShower.jpg" },
  { title: "Sensory Decoding – One Child Is Not a Control", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/995dec108_SensoryDecoding-OneChildIsNotaControl.jpg" },
  { title: "Sensory Decoding – Reasonable Sensory Accommodations", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/fd0472ab9_SensoryDecoding-ReasonableSensoryAccommodations.jpg" },
  { title: "Sensory Decoding – Recognise Sensory Cues and Respond", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/8181a78bb_SensoryDecoding-RecognizeSensoryCuesandRespond.jpg" },
  { title: "Sensory Decoding – Routine and Change", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/61a7cce43_SensoryDecoding-RoutineandChange.jpg" },
  { title: "Sensory Decoding – Sample Sensory Profile List", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/4982efb17_SensoryDecoding-SampleSensoryProfileList.jpg" },
  { title: "Sensory Decoding – Sensory Overload Is Not Just Bad Behaviour", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0fa798a37_SensoryDecoding-SensoryOverloadIsNotJustBadBehaviour.jpg" },
  { title: "Sensory Decoding – Sensory Strengths and Challenges", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e4360d6fb_SensoryDecoding-SensoryStrengthsandChallenges.jpg" },
  { title: "Sensory Decoding – Strong Protesting Patterns", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/902a9dede_SensoryDecoding-StrongProtestingPatterns.jpg" },
  { title: "Sensory Decoding – Supporting a Child's Sensory Overwhelm", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0d2daeaa6_SensoryDecoding-SupportingaChildsSensoryOverwhelm.jpg" },
  { title: "Sensory Decoding – The Brainstem and Vestibular Relationship", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/36a42e292_SensoryDecoding-TheBrainstemandVestibularRelationship.jpg" },
  { title: "Sensory Decoding – The Hidden Gap in Autism Support", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/ca22097da_SensoryDecoding-TheHiddenGapinAutismSupport.jpg" },
  { title: "Sensory Decoding – The Importance of Early Diagnosis and Intervention", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/1c88ca97e_SensoryDecoding-TheImportanceofEarlyDiagnosisandIntervention.jpg" },
  { title: "Sensory Decoding – The Missing Piece They Can't See", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/45cffce7b_SensoryDecoding-TheMissingPieceTheyCantSee.jpg" },
  { title: "Sensory Decoding – Use a Physiology-First Lens", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/1c4006961_SensoryDecoding-UseaPhysiology-FirstLens.jpg" },
  { title: "Sensory Decoding – What Internal Cues Are Before Behaviour", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d7230b3da_SensoryDecoding-WhatInternalCuesAreBeforeBehaviour.jpg" },
  { title: "Sensory Decoding – Why Do They Meltdown Over Small Things?", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/8209957f1_SensoryDecoding-WhyDoTheyMeltdownOverSmallThings.jpg" },
  { title: "Sensory Decoding – Overload vs Shutdown", category: "Sensory Decoding", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/1ecbce496_SensoryDecoding-OverloadvsShutdown.jpg" },
  // Nervous System & Meltdowns
  { title: "Sensory Overload Recognition", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/57e4cacc1_SensoryOverloadRecognition.jpg" },
  { title: "Sensory Fatigue", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d8f0dff82_SensoryFatigue.jpg" },
  { title: "Sensory Defensiveness Education", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e5d56eabd_SensoryDefensivenessEducation.jpg" },
  { title: "A Deeper Look: Sensory Systems and Behavior Regulation", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/eb2e23669_ADeeperLook-SensorySystemsandBehaviorRegulation.jpg" },
  { title: "Understanding the Sensory Nervous System", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/ef336c728_UnderstandingtheSensoryNervousSystem.jpg" },
  { title: "Fight, Flight, Freeze, Fawn", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/28b6b8735_FightFlightFreezeFawn.jpg" },
  { title: "Regulation Science – How the Nervous System Becomes Overloaded", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c45252426_RegulationScience-HowtheNervousSystemBecomesOverloadedandNeedsReset.jpg" },
  { title: "Decoding: The Difference Between a Meltdown and a Tantrum", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d29891720_Decoding-TheDifferenceBetweenaMeltdownandaTantrum.jpg" },
  { title: "Decoding Shutdown Cues Were Mistaken for Calmness", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/ca1605490_DecodingShutdownCuesWereMistakenforCalmness.jpg" },
  { title: "Early Cues", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d43080bdf_EarlyCues.jpg" },
  { title: "Updated Meltdown/Shutdown Training", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/917848b16_UpdatedMeltdownShutdownTraining.jpg" },
  { title: "Shutdowns – The Most Misunderstood Autistic Response", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0d40f69ee_Shutdowns-TheMostMisunderstoodAutisticResponse.jpg" },
  { title: "Post Shutdown Recovery", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/afd552e84_PostShutdownRecovery.jpg" },
  { title: "Transition Overload", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d8ef8b13c_TransitionOverload.jpg" },
  { title: "The Biggest Knowledge Gap – Professionals Often Don't Recognise Regulation", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e668df2c6_TheBiggestKnowledgeGap-ProfessionalsOftenDontRecogniseRegulation.jpg" },
  { title: "Myth vs Reality – Nervous System Edition", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0ebed0413_MythvsReality-NervousSystemEdition.jpg" },
  { title: "I Need Space, Not Attention", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/31200ea30_INeedSpaceNotAttention.jpg" },
  { title: "Not Avoiding You – Protecting His Energy", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/b3550fe4e_NotAvoidingYou-ProtectingHisEnergy.jpg" },
  { title: "Not Just the Heat – His Nervous System Can't Settle", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e56e7b6eb_NotJusttheHeat-HisNervousSystemCantSettle.jpg" },
  { title: "Every Boy, Every Girl, Every Country – One Nervous System", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e6cfae389_EveryBoyEveryGirlEveryCountryOneNervousSystem.jpg" },
  { title: "What to Do When a Child Is Self-Harming", category: "Nervous System", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/43735f830_WhattoDoWhenaChildIsSelf-Harming.jpg" },
  // Sensory Tools & Environment
  { title: "Sensory Breaks and Regulation Tools", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/d88074e88_SensoryBreaksandRegulationTools.jpg" },
  { title: "Interoception Awareness", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2cf0f3080_InteroceptionAwareness.jpg" },
  { title: "Interoception Confusion", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/8ffd76d18_InteroceptionConfusion.jpg" },
  { title: "Navigating My Sensory Needs", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c263691dc_NavigatingMySensoryNeeds.jpg" },
  { title: "School Sensory Environment Awareness", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/8b5689a11_SchoolSensoryEnvironmentAwareness.jpg" },
  { title: "Sensory and Equipment Specific Encoding", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/6ce713af1_SensoryandEquipmentSpecificEncoding.jpg" },
  { title: "Sensory and Hospital Specific Decoding", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/93d2c03ba_SensoryandHospitalSpecificDecoding.jpg" },
  { title: "Sensory and Movement Specific Decoding", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/5555558ca_SensoryandMovementSpecificDecoding.jpg" },
  { title: "Sensory and Transport Specific Encoding", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/1d464284a_SensoryandTransportSpecificEncoding.jpg" },
  { title: "Sensory and Waiting Specific Encoding", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/f5f7ded09_SensoryandWaitingSpecificEncoding.jpg" },
  { title: "Sensory-Safe Lunch Environments for Autistic Children", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/8804ca1b8_Sensory-SafeLunchEnvironmentsforAutisticChildren.jpg" },
  { title: "Theraputty Exercises for Special Needs Kids", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/4b77991a7_TheraputtyExercisesforSpecialNeedsKids.jpg" },
  { title: "Understanding Common Sensory Encoding Challenges", category: "Sensory Tools & Environment", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/57a9b5a25_UnderstandingCommonSensoryEncodingChallenges.jpg" },
  // School & Teaching
  { title: "Early Sensory-Phase Training (Ages 7–9)", category: "School & Teaching", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/7ec37e75d_EarlySensory-PhaseTrainingAges7-9.jpg" },
  { title: "Multisensory Teaching Techniques", category: "School & Teaching", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e93774295_MultisensoryTeachingTechniques.jpg" },
  { title: "School Support and Reasonable Adjustments", category: "School & Teaching", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/212abe641_SchoolSupportandReasonableAdjustments.jpg" },
  { title: "Teach Schools Sensory-First Training", category: "School & Teaching", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/671e036d3_TeachSchoolsSensory-FirstTraining.jpg" },
  { title: "The Heart of It – Teacher Training with Staff Focus", category: "School & Teaching", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/777bc91c0_TheHeartofIt-TeacherTrainingwithStaffFocus.jpg" },
  { title: "Why Breath Changes Are a Critical Cue for Teachers", category: "School & Teaching", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/3a875bdb6_WhyBreathChangesAreaCriticalCueforTeachers.jpg" },
  { title: "Transition-Support Training", category: "School & Teaching", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/9c5525761_Transition-SupportTraining.jpg" },
  { title: "Teaching Body-Signal Awareness", category: "School & Teaching", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/4d752e735_TeachingBody-SignalAwareness.jpg" },
  { title: "Teaching Self-Care Through Sensory Safety", category: "School & Teaching", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/67b509480_TeachingSelf-CareThroughSensorySafety.jpg" },
  { title: "Supporting Students with OCD and Autism", category: "School & Teaching", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/947417cbb_SupportingStudentswithOCDandAutism.jpg" },
  { title: "See the Behaviour, Watch the Video", category: "School & Teaching", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/251c623d3_SeetheBehaviourWatchtheVideo.jpg" },
  // Behaviour & Communication
  { title: "Beyond the Surface: Decoding Behaviour", category: "Behaviour & Communication", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/6a1e781a8_BeyondtheSurface-DecodingBehaviour.jpg" },
  { title: "Co-Regulation Instead of Behaviour Management", category: "Behaviour & Communication", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/280ce8ba8_Co-RegulationInsteadofBehaviourManagement.jpg" },
  { title: "Decoding Social Anxiety in Autism", category: "Behaviour & Communication", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/156bf977a_DecodingSocialAnxietyinAutism.jpg" },
  { title: "Decoding Stimming for Long Periods of Time", category: "Behaviour & Communication", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/12bfe0191_DecodingStimmingforLongPeriodsofTime.jpg" },
  { title: "Demand-Sensitivity Models – Teach", category: "Behaviour & Communication", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2c7af913d_Demand-SensitivityModels-Teach.jpg" },
  { title: "Problems with Forced Apologies", category: "Behaviour & Communication", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/bd8306df8_ProblemswithForcedApologies.jpg" },
  { title: "Tasks and Demands – Why Are Autistic Children So Hard?", category: "Behaviour & Communication", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0e5dce65a_TasksandDemands-WhyAreAutisticChildrenSoHard.jpg" },
  { title: "Understanding Stimming in Autism", category: "Behaviour & Communication", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2fb661f76_UnderstandingStimminginAutism.jpg" },
  { title: "Why Predictability Matters in Neurodivergence", category: "Behaviour & Communication", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/0b6b59356_WhyPredictabilityMattersinNeurodivergence.jpg" },
  { title: "Instruction Overload – Too Many Words Collapse Processing", category: "Behaviour & Communication", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2e3f64095_InstructionOverload-TooManyWordsCollapseProcessing.jpg" },
  // Communication & AAC
  { title: "15 Ways to Teach an Autistic Child to Express Emotions", category: "Communication & AAC", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/7fb4b0baf_15WaystoTeachanAutisticChildtoExpressEmotions.jpg" },
  { title: "AAC Pathways", category: "Communication & AAC", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/fa9a40205_AACPathways.jpg" },
  { title: "Decoding vs Encoding in Nonspeaking Autism", category: "Communication & AAC", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/59ea097a0_DecodingvsEncodinginNonspeakingAutism.jpg" },
  { title: "How Encoding and Decoding Shape the Nervous System", category: "Communication & AAC", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/4aa1f5ad8_HowEncodingandDecodingShapetheNervousSystem.jpg" },
  { title: "The Neuroscience of Nonspeaking Communication", category: "Communication & AAC", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/c381daf76_TheNeuroscienceofNonspeakingCommunication.jpg" },
  // Understanding Autism
  { title: "ADHD, Imposter Syndrome and the Hidden Cost of Processing", category: "Understanding Autism", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/706a6c50a_ADHDImposterSyndromeandtheHiddenCostofProcessing.jpg" },
  { title: "Autistic Traits and Strengths", category: "Understanding Autism", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/466d52af8_AutisticTraitsandStrengths.jpg" },
  { title: "Can Autism Be Diagnosed Later in Childhood?", category: "Understanding Autism", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/a9966e202_CanAutismBeDiagnosedLaterinChildhood.jpg" },
  { title: "Decoding Brain Chemistry and Emotional Differences in Autism", category: "Understanding Autism", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/72598cf14_DecodingBrainChemistryandEmotionalDifferencesinAutism.jpg" },
  { title: "Processing Speed Is Not Intelligence", category: "Understanding Autism", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/a9cf8d7b5_ProcessingSpeedIsNotIntelligence.jpg" },
  { title: "What It Feels Like to Be AuDHD", category: "Understanding Autism", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/14b3db43e_WhatItFeelsLiketoBeAuDHD.jpg" },
  { title: "Why Does Autism Happen?", category: "Understanding Autism", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/e8d15c203_WhyDoesAutismHappen.jpg" },
  { title: "What Soreness Feels Like Inside the Autistic Body", category: "Understanding Autism", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/2eb8091c4_WhatSorenessFeelsLikeInsidetheAutisticBody.jpg" },
  { title: "Why Early Sensory Support Prevents Years of Misunderstood Behaviour", category: "Understanding Autism", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/b3b3e7494_WhyEarlySensorySupportPreventsYearsofMisunderstoodBehaviour.jpg" },
  { title: "Visual Guide: Body Language of Sensory Overload", category: "Understanding Autism", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/be0315715_VisualGuide-BodyLanguageofSensoryOverload.jpg" },
  { title: "Trauma-Informed Sensory Practice", category: "Understanding Autism", url: "https://media.base44.com/images/public/69d54775d9a169daad84a133/79387bc47_Trauma-InformedSensoryPractice.jpg" },
];

const CATEGORIES = ["All", ...Array.from(new Set(GALLERY_IMAGES.map(i => i.category)))];

const CATEGORY_COLORS = {
  "Emotional Regulation": "bg-rose-100 text-rose-700 border-rose-200",
  "Sensory Decoding": "bg-purple-100 text-purple-700 border-purple-200",
  "Nervous System": "bg-blue-100 text-blue-700 border-blue-200",
  "Sensory Tools & Environment": "bg-teal-100 text-teal-700 border-teal-200",
  "School & Teaching": "bg-amber-100 text-amber-700 border-amber-200",
  "Behaviour & Communication": "bg-orange-100 text-orange-700 border-orange-200",
  "Communication & AAC": "bg-green-100 text-green-700 border-green-200",
  "Understanding Autism": "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export default function TrainingImageGallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered = GALLERY_IMAGES.filter(img => {
    const matchCat = activeCategory === "All" || img.category === activeCategory;
    const matchSearch = !search || img.title.toLowerCase().includes(search.toLowerCase()) || img.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length);
  const nextImage = () => setLightboxIndex(i => (i + 1) % filtered.length);

  // keyboard nav
  const handleKeyDown = (e) => {
    if (lightboxIndex === null) return;
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "Escape") closeLightbox();
  };

  return (
    <div className="space-y-5" onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">Training Image Library</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{GALLERY_IMAGES.length} training infographics · click any image to enlarge</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full h-9 pl-8 pr-3 rounded-xl border border-input bg-transparent text-sm"
            placeholder="Search images…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {cat}
            {cat !== "All" && (
              <span className="ml-1 opacity-60">
                ({GALLERY_IMAGES.filter(i => i.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">Showing {filtered.length} of {GALLERY_IMAGES.length} images</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground italic text-sm">No images match your search.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((img, idx) => (
            <div
              key={img.url}
              className="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all"
              onClick={() => openLightbox(idx)}
            >
              <div className="aspect-[3/4] overflow-hidden bg-secondary">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-2">
                <p className="text-[11px] font-bold leading-tight line-clamp-2">{img.title}</p>
                <span className={`inline-block mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-full border ${CATEGORY_COLORS[img.category] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {img.category}
                </span>
              </div>
              {/* hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-xs font-bold px-3 py-1.5 rounded-full shadow transition-opacity">
                  View Full Size
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
            onClick={closeLightbox}
          >
            <X size={22} />
          </button>

          {/* Prev */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
            onClick={e => { e.stopPropagation(); prevImage(); }}
          >
            <ChevronLeft size={26} />
          </button>

          {/* Image */}
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={filtered[lightboxIndex].url}
              alt={filtered[lightboxIndex].title}
              className="max-h-[80vh] max-w-full rounded-xl shadow-2xl object-contain"
            />
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-white font-bold text-sm">{filtered[lightboxIndex].title}</p>
                <span className={`inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[filtered[lightboxIndex].category] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {filtered[lightboxIndex].category}
                </span>
              </div>
              <a
                href={filtered[lightboxIndex].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition"
                title="Open original"
              >
                <ExternalLink size={16} />
              </a>
            </div>
            <p className="text-white/40 text-xs">{lightboxIndex + 1} / {filtered.length}</p>
          </div>

          {/* Next */}
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
            onClick={e => { e.stopPropagation(); nextImage(); }}
          >
            <ChevronRight size={26} />
          </button>
        </div>
      )}
    </div>
  );
}