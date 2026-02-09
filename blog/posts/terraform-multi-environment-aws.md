---
title: "Managing Multi-Environment AWS Infrastructure with Terraform"
date: 2026-02-05
description: "How to structure Terraform projects for managing multiple AWS environments with workspaces, modules, and state isolation."
tags: ["Terraform", "AWS", "IaC", "Infrastructure"]
readTime: "12 min read"
image: "https://placehold.co/780x400/111827/a78bfa?text=Terraform+%2B+AWS+Multi-Environment"
imageAlt: "Terraform and AWS Multi-Environment Infrastructure"
---

One of the most common challenges in infrastructure management is running multiple environments (dev, staging, production) without drowning in duplicated configuration. Terraform solves this elegantly when structured correctly. Here's the approach we've refined over two years of managing AWS infrastructure for e-commerce platforms.

## The Problem with Copy-Paste Infrastructure

The naive approach is to create separate Terraform directories for each environment. This works initially but quickly becomes a maintenance nightmare:

- A change needs to be applied to every environment manually
- Environments drift apart over time
- No guarantee that what works in staging will work in production
- Reviewing infrastructure changes becomes tedious

> If your staging environment doesn't match production, it's not actually testing anything. It's just giving you a false sense of confidence.

## Project Structure

We use a modular structure with environment-specific variable files. One codebase, multiple configurations:

![Terraform project structure diagram](https://placehold.co/780x350/111827/f472b6?text=Terraform+Project+Structure)

```
infrastructure/
  modules/
    networking/
      main.tf
      variables.tf
      outputs.tf
    compute/
      main.tf
      variables.tf
      outputs.tf
    database/
      main.tf
      variables.tf
      outputs.tf
  environments/
    dev.tfvars
    staging.tfvars
    production.tfvars
  main.tf
  variables.tf
  outputs.tf
  backend.tf
  versions.tf
```

### Module Design

Each module encapsulates a logical group of resources. The key principle: modules should be **environment-agnostic**. They accept parameters and produce outputs, but never contain environment-specific values.

```hcl
# modules/networking/main.tf
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.common_tags, {
    Name = "${var.project}-${var.environment}-vpc"
  })
}

resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.common_tags, {
    Name = "${var.project}-${var.environment}-private-${count.index + 1}"
    Tier = "private"
  })
}
```

### Environment Variables

Each environment gets its own `.tfvars` file that defines the specific values:

```hcl
# environments/production.tfvars
environment = "production"
region      = "ap-southeast-2"

# Networking
vpc_cidr             = "10.0.0.0/16"
private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnet_cidrs  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

# Compute
instance_type     = "m6i.xlarge"
min_capacity      = 3
max_capacity      = 12
desired_capacity  = 3

# Database
db_instance_class    = "db.r6g.xlarge"
db_multi_az          = true
db_backup_retention  = 30
```

```hcl
# environments/dev.tfvars
environment = "dev"
region      = "ap-southeast-2"

# Networking
vpc_cidr             = "10.10.0.0/16"
private_subnet_cidrs = ["10.10.1.0/24", "10.10.2.0/24"]
public_subnet_cidrs  = ["10.10.101.0/24", "10.10.102.0/24"]

# Compute
instance_type     = "t3.medium"
min_capacity      = 1
max_capacity      = 2
desired_capacity  = 1

# Database
db_instance_class    = "db.t3.medium"
db_multi_az          = false
db_backup_retention  = 7
```

## State Isolation

State isolation between environments is critical. We use S3 backend with DynamoDB locking, with separate state files per environment:

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "ap-southeast-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

We use Terraform workspaces to separate state:

```bash
# Switch to production workspace
terraform workspace select production

# Plan with production variables
terraform plan -var-file=environments/production.tfvars

# Apply
terraform apply -var-file=environments/production.tfvars
```

## CI/CD Integration

Infrastructure changes go through the same review process as application code. Our GitHub Actions workflow:

![Terraform CI/CD workflow](https://placehold.co/780x250/111827/fbbf24?text=Plan+on+PR+%E2%86%92+Review+%E2%86%92+Apply+on+Merge)

1. **On Pull Request** -- `terraform plan` runs and posts the output as a PR comment
2. **Review** -- team reviews the plan diff before approving
3. **On Merge** -- `terraform apply` runs automatically for the target environment

```yaml
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3

      - name: Terraform Init
        run: terraform init

      - name: Select Workspace
        run: terraform workspace select ${{ env.ENVIRONMENT }}

      - name: Terraform Plan
        id: plan
        run: terraform plan -var-file=environments/${{ env.ENVIRONMENT }}.tfvars -no-color
        continue-on-error: true

      - name: Comment Plan on PR
        uses: actions/github-script@v7
        with:
          script: |
            const plan = `${{ steps.plan.outputs.stdout }}`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `### Terraform Plan\n\`\`\`\n${plan}\n\`\`\``
            });
```

## Lessons Learned

After managing this setup across multiple projects, here's what I wish I knew from the start:

- **Start with modules early** -- refactoring a flat Terraform config into modules later is painful
- **Use consistent tagging** -- every resource should have `Environment`, `Project`, and `ManagedBy` tags
- **Version pin everything** -- providers, modules, and Terraform itself
- **Use `terraform fmt` and `terraform validate` in CI** -- catches issues early
- **Document your modules** -- future you will thank present you

---

Infrastructure as Code isn't just about automation -- it's about making your infrastructure reviewable, testable, and reproducible. The initial setup takes effort, but the payoff in reliability and team confidence is worth it.
