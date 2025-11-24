import requests
import pprint
import random
import uuid

GGK_URL="https://ggk-stack-test.ggk.archembaud.com"
CREATE_RULES=True

def get_rules_for_user(user_id):
    header = {
        "Authorization": f"{user_id}"
    }
    response = requests.get(f"{GGK_URL}/rules", headers=header)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to get rules for user {user_id}: {response.status_code}")
        return None


def send_rules_to_server(rule_data, user_id):
    header = {
        "Authorization": f"{user_id}",
        "Content-Type": "application/json"
    }
    response = requests.post(f"{GGK_URL}/rules", headers=header, json=rule_data)
    if response.status_code == 201:
        print("Rules created successfully")
        pprint.pprint(response.json())
    else:
        print(f"Failed to create rules: {response.status_code}")
        pprint.pprint(response.json())


def create_rule_for_user(user_id):
    # we'll make our api the same
    ruleAPI = "api.example.com"
    no_rules = random.randint(1,5)
    no_users = random.randint(1,3)
    user_rules = []
    for _user in range(no_users):
        rule_user = str(uuid.uuid4())
        print(f"Creating rules for user {rule_user}")
        path_rules = []
        for _ in range(no_rules):
            methods = random.choice(["GET", "POST", "PUT", "DELETE"])
            path_pattern = f"/api/v1/{random.choice(['users', 'admin', 'data'])}/*"
            effect = random.choice(["ALLOWED", "DISALLOWED"])
            path_rules.append({
                "methods": methods,
                "path_pattern": path_pattern,
                "effect": effect
            })

        rule_data = {
            "ruleAPI": ruleAPI,
            "userRules": [
                {
                    "userID": rule_user,
                    "pathRules": path_rules
                }
            ]
        }
        user_rules.append(rule_data)
        # Send these in, one at a time?
        send_rules_to_server(rule_data, user_id)


def delete_rule_for_user(user_id, rule_id):
    header = {
        "Authorization": f"{user_id}"   
    }
    response = requests.delete(f"{GGK_URL}/rules/{rule_id}", headers=header)
    if response.status_code == 200:
        print("Rules deleted successfully")
    else:
        print(f"Failed to delete rules: {response.status_code}")
        pprint.pprint(response.json())



if __name__ == "__main__":
    # Generate some rules for NCKU students to play with
    # Fix the userID list so we can clean these up later
    users = [
        "29c4f681-4baa-4f68-83af-120a5ec1210c",
        "c9544cb4-0064-49b2-8ee8-6a8e2706bcaf",
        "75adfe1d-2f27-4f4c-9cf4-c17ed2fdc4fe",
        "01a16664-05bb-4585-a0b2-96d4e2835c7c",
        "c0fe91a7-cfc9-4527-967b-4b9b9e1ed730",
        "84e35798-790c-4a2f-ad95-1644e0d07c60",
        "e0ca46d4-d159-4f20-ac8b-9dcd03c024c0"
    ]
    print("Going through user list to create rules")
    print("=========================")
    for user_id in users:
        if CREATE_RULES:
            print(f"Creating rule data for {user_id}")
            rule_data = create_rule_for_user(user_id)
            # Now fetch the rules
            #print("Fetch the rules from the server")
            server_rule_data = get_rules_for_user(user_id)
            pprint.pprint(server_rule_data)
        else:
            # Delete the rules
            print(f"Deleting rule data for {user_id}")
            server_rule_data = get_rules_for_user(user_id)
            # This needs to be done, one rule at a time
            for rule in server_rule_data['rules']:
                delete_rule_for_user(user_id, rule['ruleId'])
            # Confirm
            server_rule_data = get_rules_for_user(user_id)
            print(server_rule_data)