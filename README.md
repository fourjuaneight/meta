# Meta

![worker](https://github.com/fourjuaneight/meta/actions/workflows/worker.yml/badge.svg)<br/>

I have a small battallion of workers that handle interaction with a Hasura database. A lot of the stuff I save has tags, categories, etc. I keep all that metadata in another set of tables. This worker is meant for interactions with said tables.

All code is self-documented. Aside from the specific names of tables in Hasura, everything is easily portable and ready to fork. You'll just need to provide your environment variables.