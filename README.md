Adomy | Atlantis - Projet GL02
==============

### Description

Adomy / Atlantis est un logiciel d'aide à la gestion d'interventions développé par Atlantis pour des acteurs d'une association d'aide à la personne appelée ADOMY.

Grâce à son interface en ligne de commande, il permet, à partir d'emplois du temps sous format iCalendar, de visualiser des conflits de disponibilité, de convertir des emplois du temps sous format tableur et de visualiser le volume horaire de travail effectué par un acteur.

La solution logicielle a été réalisée dans le cadre de l'U.V. GL02 à l'Université Technologique de Troyes (UTT).

Application suivant le cahier des charges livré par le groupe Atlantis.
Cette application est composée de deux parser : un parser de fichiers de type iCalendar et un autre parsant les fichiers de type Csv. Trois fonctionnalités sont disponibles. La première est la détection de conflits entre différents fichiers iCalendar pour une adresse donnée. La deuxième est la conversion de fichiers Csv en iCalendar. Enfin la troisième et dernière fonctionnalité permet de calculer le nombre d'heures totales réalisées pour chaque intervenants ainsi que le nombre d'interventions pour chacun au cours d'une semaine donnée.

### Initiatives prises

Etant donnée la liberté d'action autorisée par le cahier des charges nous ayant été fourni, des décisions ont dûes être prises pour mener à bien ce projet. Les voici.

Tout d'abord il n'était pas précisé sur quelle référence se baser (l'EF_1) pour trouver les conflits pour un domicile. Nous avons donc décidé que l'utilisateur devra saisir l'adresse pour qu'ensuite l'application trouve les enventuels conflits en ce lieu. La liste des conflits pour ce lieu et pour chaque rendez-vous est créée dans un document csv.  Nous avons dû définir un format, ce dernier n'ayant pas été défini dans le cahier des charges (voir un peu plus bas dans ce document).

Pour l'EF_2, nous avons défini une cellule type d'un rendez-vous :
fonctionIntervenant-nomIntervenant-prenomIntervenant-telIntervenant-societeIntervenant-prenomPatient-nomPatient-telPatient-villePatient-numRuePatient ruePatient-codePostalPatient.
Cette cellule-type est reprise dans l'ABNF suivante, décrivant le CSV d'un planning de domicile :

```
CSV                     =   COLONNES *(CRLF LIGNE)
COLONNES                =   ‘lundi;mardi;mercredi;jeudi;vendredi;samedi;dimanche’
LIGNE                   =   *RDV.';'.*RDV.';'.*RDV.';'.*RDV.';'.*RDV.';'.*RDV.';'.*RDV.';'
RDV                     =   FONCTIONINTERVENANT.'-'.NOMINTERVENANT.'-'.PRENOMINTERVENANT.'-'.TELINTERVENANT.'-'.SOCIETEINTERVENANT.'-'.NOMPATIENT.'-'.PRENOMPATIENT.'-'.TELPATIENT.'-'.VILLEPATIENT.'-'.NUMRUEPATIENT RUEPATIENT.'-'.CODEPOSTALPATIENT
FONCTIONINTERVENANT     =   TEXTAPOSTROPHE
NOMINTERVENANT          =   TEXTAPOSTROPHE
PRENOMINTERVENANT       =   TEXT
TELINTERVENANT          =   10DIGIT
SOCIETEINTERVENANT      =   1*(VCHAR WSP VCHAR/VCHAR/VCHAR.'''.VCHAR/DIGIT/DIGIT WSP VCHAR/VCHAR WSP DIGIT)
NOMPATIENT              =   TEXTAPOSTROPHE
PRENOMPATIENT           =   TEXT
TELPATIENT              =   10DIGIT
VILLEPATIENT            =   TEXTAPOSTROPHE
NUMRUEPATIENT           =   1*DIGIT WSP 1*(VCHAR/VCHAR WSP VCHAR/VCHAR.'''.VCHAR)
CODEPOSTALPATIENT       =   5DIGIT
TEXT                    =   1*(VCHAR WSP VCHAR/VCHAR)
TEXTAPOSTROPHE          =   1*(VCHAR WSP VCHAR/VCHAR/VCHAR.'''.VCHAR)
```

L'utilisateur passe en paramètre le nom du fichier Csv contenant le planning à transformer. L'application vérifie la conformité du planning et le transforme en planning au format iCalendar.

Pour l'EF_3, nous avons choisi la solution qui est que l'utilisateur passe en paramètre, en plus des plannings a comparer, la date du lundi de la semaine à analyser. A partir de cette date l'application peut calculer le volume horaire des intervenants pour la semaine ainsi que le nombre d'intervention. Il est possible de passer plusieurs plannings pour un même intervenant, l'application s'assurera de trouver les interventions pour la semaine voulue.

**Format iCalendar :**

```
ICalendar   =   'BEGIN:VCALENDAR' CRLF 'VERSION:2.0' CRLF 'PRODID:-//hacksw/handcal//NONSGML v1.0//EN' *VEVENT 'END:VCALENDAR'
VEVENT      =   'BEGIN:VEVENT' CRLF DTSTART CRLF DURATION CRLF ORGANIZER CRLF LOCATION CRLF CONTACT CRLF 'END:VEVENT'
DTSTART     =   'DTSTART:'.8DIGIT.'T'.6DIGIT
DURATION    =   'DURATION:PT'.1/2DIGIT.'H'.1/2DIGIT.'M'.1/2DIGIT.'S'
ORGANIZER   =   'ORGANIZER:'.TEXT.','.TEXT.','.TEXT.','.10DIGIT
LOCATION    =   'LOCATION:'.TEXT.','.TEXTBIS.','.5DIGIT
CONTACT     =   'CONTACT:'.TEXT.'\,'.10DIGIT
TEXT        =   1*(WSP/VCHAR)
TEXTBIS     =   1*(WSP/VCHAR/DIGIT)
```

**Format de sortie csv fonctionnalité n°1 :**

Le nom du fichier créé sera de la forme : `'conflict-'.<Ville>.'_'.<adresse>.'_'.<code postal>.'.csv'`
Il sera crée dans un dossier "conflits" qui devra se situer à la racine du projet.
Chaque ligne correspond à un conflit pour une tranche horaire donnée.

```
CSVSORTIE           =   1*LIGNE 
LIGNE               =   CRLF 2*COLONNE
COLONNE             =   RDV
RDV                 =   DATE.'-'.HEUREDEBUT.'-'.HEUREFIN.'-'.FONCTIONINTERVENANT.'-'.NOMINTERVENANT.'-'.ENTREPRISE.'-'.TELINTERVENANT
DATE                =   4DIGIT.'/'.2DIGIT.'/'.2DIGIT
HEUREDEBUT          =   2DIGIT.':'.2DIGIT.':'.2DIGIT
HEUREFIN            =   2/1DIGIT.':'.2/1DIGIT.':'.2/1DIGIT
FONCTIONINTERVENANT =   TEXT
NOMINTERVENANT      =   TEXT
ENTREPRISE          =   TEXTBIS
TELINTERVENANT      =   10DIGIT
TEXT                =   1*(WSP/VCHAR)
TEXTBIS             =   1*(WSP/VCHAR/DIGIT)
```

### Utilisation

Installer les modules requis avec la commande suivante :

```bash
$ npm install
```

Fonctionnalité n°1

```bash
$ node main 1 <adresse> 2*<fichier.ics>
    - <adresse> = chaîne de caractère de type "<Ville>,<info rue>,<code postal>"
```

Fonctionnalité n°2

```bash
$ node mainApp 2 <fichier.csv>
    - <fichier.csv> = nom du fichier à transformer au format Csv
```

Fonctionnalité n°3

```bash
$ node main 3 <date> 1*<fichier.ics>
    - <date> = format jj/mm/aaaa
```

Remarque : Le chiffre <1,2,3> utilisé correspond au numéro de la fonctionnalité que l'on souhaite utiliser.

### Fichiers test

Des fichiers test sont présents dans le dossier `sample` se trouvant à la racine du projet.
Des fichiers de type iCalendar ont été réalisé dans le but de les passer en paramètre à l'application. Ainsi en faisant varier les valeurs au sein de ces fichiers nous pouvons déceler les éventuels problèmes ou encore voir les résultats.
Un fichier de type CSV pouvant être passé en paramètre et permettant l'obtention d'un fichier ICalendar du même nom que le fichier CSV permet de tester le parsing d'un CSV et l'EF2.

#### Version : 1.0.2


### Liste des contributeurs

**Professeurs**
- Matthieu Tixier <matthieu.tixier@utt.fr>
- Jean-Pierre Cahier <jean_pierre.cahier@utt.fr>

**Équipe Atlantis**
- Yassine DOGHRI <yassine.doghri@utt.fr>
- Valentin HACHET <valentin.hachet@utt.fr>
- Youssef Nassim AZIZ <youssef_nassim.aziz@utt.fr>
- Ayoub BAKKALI EL KASMI <ayoub.bakkali_el_kasmi@utt.fr>

**Équipe Dionysos**
- Rémi Beraux <remi.beraux@utt.fr>
- Vincent Fouquet <vincent.fouquet@utt.fr>
- Alexis Grosjean <alexis.grosjean@utt.fr>
- Shiduo Shiduo <shiduo.zhang@utt.fr>
