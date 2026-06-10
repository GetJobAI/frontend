default:
    @just --list --unsorted

scripts := justfile_directory() / 'scripts'
local_scripts := justfile_directory() / '.scripts'

# Start backend stack and sync OpenAPI clients
up:
    {{scripts}}/up

# Stop backend stack
down:
    {{scripts}}/down

# Local-only dev helper (requires .scripts/wizard-example)
wizard-example user_email='':
    {{local_scripts}}/wizard-example {{user_email}}
