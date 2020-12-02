# 🔴 whole-mars-calendar

![cover](https://danieledep.github.io/whole-mars-calendar/0-0.png)

## Neat, what is this?  
A dithering playground, a calendar for another planet, a window on the inner solar system, an interactive map, all together. I wanted to learn some front-end libraries but also for curiosity I imagined how a basic tool as the calendar should change on the most hyped planet of the solar system, Mars, where people will have to deal with many hardships and limitations.


## Are there months on Mars?  
This calendar is similar to ours. A year on Mars has 668 sols, days that span around 24h and 40 minutes, so a martian year roughly doubles our Earth year length, and many people have imagined systems to divide them up. While scientists usually just count the sols from the start of the year and that's it, I think that when you have a continuous settlement it's convenient to have smaller chunks of time for keeping track of repetitive matters. I based the subdivision on the Darian Calendar which divides the Mars Year in 24 months of 28 and 27 sols. The year starts every Vernal equinox, which is already the standard for scientists studying the martian seasons. When to count the year Zero from is a debated matter, the Darian Calendar uses 1610, others use 1953 (I did too), I think that when we'll have a continuous human presence it will probably restart from zero anyways.


## There's more to it  
The martian life will bring heavy constraints to the first settlers: communication, dust storms, oxygen, energy, so to help with the most pressing and time-based of those I added some available information into the calendar. Since any first colony will be still very dependant from Earth, communication with Earth will be super important, but with the distance between the two planets ranging from 100M to 400M kilometers, so the time gap for one-direction communication will vary between 5 and 20 minutes. Just imagine typing a url and wait forty minutes for a response. Even more crucial will be the supplies and people coming from Earth, so it will be useful to see in a glance upcoming transfer orbits and in general the positioning of the two planets.
In the bottom right box I thought would be useful to have a handy small topographic map of the area of the outpost. Geography is helpful to navigate the rough terrains of Mars, but it also gives insights about one of the most precious resources on Mars: solar light. In this interactive map you can drag the marker around the map to see how solar irradiation changes during the seasons and throughout the latitudes.


## Not perfect, but still nice  
What started as a small learning project has become something I felt passionate about. I'm actually happy to show it around, but at the same time I feel it could use some polishing (better cartography, better graphics, improved orbit calculations..). Also this project could take different shapes, for example I already printed a paper version for my desk! I really would like for this project to keep on growing and that would also help me give life to other ideas, so in case you are curious about them too, you can help me make those come true by purchasing the pdf version of the next Martian year, which will start on February 2021.

[Buy the pdf copy](https://gum.co/SPmNF)

It consists of 24 pages one for each month, and in each of them I handpicked the best dithered images I could get. I'm commited to continue to make improvements, so for anybody buying this, I will gift a pdf of the new version when that will be ready. If you are really interested on those paper version of the calendar and the future twists this or other projects will take, please sign up to the mailing list, of course no spammy intentions here.

[Sign up to the newsletter](https://tinyletter.com/danieledep)

## Credits

*   The Darian calendar was devised by [Thomas Gangale](https://www.researchgate.net/publication/290542846_The_Architecture_of_Time_Part_2_The_Darian_System_for_Mars)
*   the [cover picture](https://mars.nasa.gov/resources/6453/valles-marineris-hemisphere-enhanced/) and the images from the rovers are credited to NASA/JPL-Caltech
*   the rovers pictures are downloaded through the [NASA API](https://api.nasa.gov/#marsphotos) and dithered locally
*   elevation data and labelling come from [Openplanetary](https://github.com/openplanetary/opm/wiki/OPM-Mars-Basemap-v0.1)
*   Martian date calculations and solar angulation formulas are handled by these nice libraries: [Marsdate.js](https://github.com/aresastro/marsdatejs) and [jsMarstime](https://github.com/eelsirhc/jsMarsTime)
*   both libraries are based on the Mars24 algorithms from the papers [Allison and McEwen (2000)](https://www.sciencedirect.com/science/article/abs/pii/S0032063399000926?via%3Dihub) and [Allison (1997)](https://agupubs.onlinelibrary.wiley.com/doi/abs/10.1029/97GL01950)
*   the window opportunities parameters come from [NASA's Trajectory Browser](https://trajbrowser.arc.nasa.gov/)
*   planets positionings come from [solaris-model library](https://github.com/skepticalimagination/solaris-model)
*   data inputs use the great [Tweakpane](https://cocopon.github.io/tweakpane/)
*   big thanks to all the people behind three.js, Vue and D3

## Follow for more  
[twitter link](https://twitter.com/danieledep)  
[github link](https://github.com/danieledep)  

