# Generated by Django 2.2.27 on 2022-05-10 15:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("emails", "0044_profile_num_email_replied_in_deleted_address"),
    ]

    operations = [
        migrations.AddField(
            model_name="deletedaddress",
            name="num_replied",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
